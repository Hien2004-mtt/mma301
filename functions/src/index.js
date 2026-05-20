const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { logger } = require('firebase-functions');

initializeApp();

const db = getFirestore();

function safeString(value) {
  return String(value || '').trim();
}

async function getUserNativeFcmTokens(userId) {
  const normalizedUserId = safeString(userId);

  if (!normalizedUserId || normalizedUserId === 'anonymous') {
    return [];
  }

  const snapshot = await db.collection('pushTokens').where('userId', '==', normalizedUserId).get();

  return snapshot.docs
    .map((docItem) => {
      const data = docItem.data() || {};
      return {
        docId: docItem.id,
        token: safeString(data.nativeToken),
        type: safeString(data.nativeType).toLowerCase(),
      };
    })
    .filter((item) => item.token && item.type === 'fcm');
}

async function sendPushToUsers({ userIds = [], title, body, data = {} }) {
  const dedupedUserIds = [...new Set(userIds.map((item) => safeString(item)).filter(Boolean))];

  if (!dedupedUserIds.length) {
    return;
  }

  const tokenBundles = await Promise.all(dedupedUserIds.map((userId) => getUserNativeFcmTokens(userId)));
  const bundles = tokenBundles.flat();

  if (!bundles.length) {
    logger.info('No FCM tokens found for recipients', { userCount: dedupedUserIds.length });
    return;
  }

  const tokens = bundles.map((item) => item.token);

  const response = await getMessaging().sendEachForMulticast({
    tokens,
    notification: {
      title,
      body,
    },
    data: Object.fromEntries(Object.entries(data).map(([key, value]) => [key, safeString(value)])),
    android: {
      priority: 'high',
      notification: {
        channelId: 'default',
      },
    },
  });

  if (response.failureCount > 0) {
    const invalidTokenDocIds = [];

    response.responses.forEach((item, index) => {
      if (!item.success) {
        const errorCode = item.error?.code || 'unknown';

        logger.warn('FCM send failed', {
          errorCode,
          token: bundles[index]?.token,
        });

        if (
          errorCode === 'messaging/registration-token-not-registered' ||
          errorCode === 'messaging/invalid-registration-token'
        ) {
          invalidTokenDocIds.push(bundles[index]?.docId);
        }
      }
    });

    if (invalidTokenDocIds.length) {
      const batch = db.batch();

      invalidTokenDocIds
        .filter(Boolean)
        .forEach((docId) => batch.delete(db.collection('pushTokens').doc(docId)));

      await batch.commit();
    }
  }
}

exports.onAnswerCreatedNotify = onDocumentCreated('questions/{questionId}/answers/{answerId}', async (event) => {
  const answerData = event.data?.data();

  if (!answerData) {
    return;
  }

  const questionId = event.params?.questionId;
  const answerId = event.params?.answerId;
  const authorId = safeString(answerData.createdBy);

  if (!questionId) {
    return;
  }

  const questionSnap = await db.collection('questions').doc(questionId).get();

  if (!questionSnap.exists) {
    return;
  }

  const questionData = questionSnap.data() || {};
  const questionOwnerId = safeString(questionData.createdBy);

  if (!questionOwnerId || questionOwnerId === authorId) {
    return;
  }

  await sendPushToUsers({
    userIds: [questionOwnerId],
    title: 'Bai cua ban co loi giai moi',
    body: 'Co nguoi vua dang loi giai cho cau hoi cua ban.',
    data: {
      type: 'answer_created',
      questionId,
      answerId,
    },
  });

  await db.collection('questions').doc(questionId).set(
    {
      lastNotifiedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
});

exports.onCommentCreatedNotify = onDocumentCreated(
  'questions/{questionId}/answers/{answerId}/comments/{commentId}',
  async (event) => {
    const commentData = event.data?.data();

    if (!commentData) {
      return;
    }

    const questionId = event.params?.questionId;
    const answerId = event.params?.answerId;
    const commentId = event.params?.commentId;
    const commenterId = safeString(commentData.createdBy);

    if (!questionId || !answerId) {
      return;
    }

    const [questionSnap, answerSnap] = await Promise.all([
      db.collection('questions').doc(questionId).get(),
      db.collection('questions').doc(questionId).collection('answers').doc(answerId).get(),
    ]);

    if (!questionSnap.exists || !answerSnap.exists) {
      return;
    }

    const questionOwnerId = safeString(questionSnap.data()?.createdBy);
    const answerOwnerId = safeString(answerSnap.data()?.createdBy);

    const recipients = [questionOwnerId, answerOwnerId].filter(
      (userId) => userId && userId !== commenterId && userId !== 'anonymous'
    );

    if (!recipients.length) {
      return;
    }

    await sendPushToUsers({
      userIds: recipients,
      title: 'Co binh luan moi',
      body: 'Co nguoi vua binh luan vao bai giai/cau hoi cua ban.',
      data: {
        type: 'comment_created',
        questionId,
        answerId,
        commentId,
      },
    });
  }
);

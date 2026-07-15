const API_URL = window.location.origin + "/api";
let currentTab = "dashboard";
let salesChart = null;

// Khởi chạy khi load trang
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("adminToken");
  const userStr = localStorage.getItem("adminUser");

  if (token && userStr) {
    const user = JSON.parse(userStr);
    showAdminPanel(user);
  } else {
    showLoginView();
  }

  // Sự kiện Form Login
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  // Sự kiện Form Product
  const productForm = document.getElementById("product-form");
  if (productForm) {
    productForm.addEventListener("submit", handleProductSubmit);
  }
});

// Hiển thị giao diện Đăng nhập
function showLoginView() {
  document.getElementById("login-view").classList.remove("hidden");
  document.getElementById("admin-panel").classList.add("hidden");
}

// Hiển thị giao diện Admin chính
function showAdminPanel(user) {
  document.getElementById("login-view").classList.add("hidden");
  document.getElementById("admin-panel").classList.remove("hidden");

  document.getElementById("admin-name").innerText = user.name || "Admin";
  document.getElementById("admin-email").innerText = user.email || "";

  switchTab("dashboard");
}

// Xử lý đăng nhập
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  const errorDiv = document.getElementById("login-error");

  errorDiv.classList.add("hidden");

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Đăng nhập không thành công.");
    }

    // Kiểm tra xem có phải Admin không
    if (data.user.role !== "admin") {
      throw new Error("Truy cập bị từ chối. Bạn không phải là Admin.");
    }

    localStorage.setItem("adminToken", data.token);
    localStorage.setItem("adminUser", JSON.stringify(data.user));

    showAdminPanel(data.user);
  } catch (err) {
    errorDiv.innerText = err.message;
    errorDiv.classList.remove("hidden");
  }
}

// Đăng xuất
function logoutAdmin() {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
  showLoginView();
}

// Chuyển đổi tab hiển thị
function switchTab(tabName) {
  currentTab = tabName;

  // Cập nhật UI Menu Sidebar
  const tabButtons = document.querySelectorAll(".nav-btn");
  tabButtons.forEach((btn) => {
    btn.className = "nav-btn w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-sm font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-900 border border-transparent";
  });

  const activeBtn = document.getElementById(`tab-btn-${tabName}`);
  if (activeBtn) {
    activeBtn.className = "nav-btn w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-sm font-medium bg-gradient-to-r from-pink-500/10 to-rose-500/10 text-pink-400 border border-pink-500/20";
  }

  // Hiển thị views tương ứng
  document.getElementById("view-dashboard").classList.add("hidden");
  document.getElementById("view-products").classList.add("hidden");
  document.getElementById("view-orders").classList.add("hidden");

  document.getElementById(`view-${tabName}`).classList.remove("hidden");

  // Cập nhật tiêu đề header
  const titleMap = {
    dashboard: "Bảng điều khiển & Thống kê doanh thu",
    products: "Quản lý sản phẩm giày",
    orders: "Quản lý & Duyệt đơn hàng",
  };
  document.getElementById("current-view-title").innerText = titleMap[tabName];

  // Load dữ liệu của tab đó
  if (tabName === "dashboard") {
    loadDashboardStats();
  } else if (tabName === "products") {
    loadProducts();
  } else if (tabName === "orders") {
    loadOrders();
  }
}

// -------------------- PHẦN: THỐNG KÊ & DASHBOARD --------------------
async function loadDashboardStats() {
  const token = localStorage.getItem("adminToken");
  try {
    const res = await fetch(`${API_URL}/statistics`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Không thể tải thống kê");
    const data = await res.json();

    // Điền số liệu tổng quan
    document.getElementById("stat-revenue").innerText = data.totalRevenue.toLocaleString("vi-VN") + "đ";
    document.getElementById("stat-orders").innerText = data.totalOrders;
    document.getElementById("stat-products").innerText = data.totalProducts;
    document.getElementById("stat-users").innerText = data.usersBreakdown.customers;

    // Điền số liệu theo trạng thái đơn hàng
    document.getElementById("orders-pending").innerText = data.statusCounts.pending;
    document.getElementById("orders-processing").innerText = data.statusCounts.processing;
    document.getElementById("orders-shipped").innerText = data.statusCounts.shipped;
    document.getElementById("orders-cancelled").innerText = data.statusCounts.cancelled;

    // Vẽ biểu đồ cột doanh thu tháng
    renderSalesChart(data.monthlySales);

    // Điền bảng đơn hàng gần đây
    const tbody = document.getElementById("recent-orders-table-body");
    tbody.innerHTML = "";
    if (data.recentOrders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">Chưa có đơn hàng nào.</td></tr>`;
      return;
    }

    data.recentOrders.forEach((order) => {
      const tr = document.createElement("tr");
      tr.className = "border-b border-gray-800/50 hover:bg-gray-850/20 transition-all";
      tr.innerHTML = `
        <td class="px-6 py-4 font-mono text-xs text-gray-400">#${order._id.substring(order._id.length - 8)}</td>
        <td class="px-6 py-4 font-medium text-white">${order.userId ? order.userId.name : "Vô danh"}</td>
        <td class="px-6 py-4 text-gray-400">${new Date(order.createdAt).toLocaleString("vi-VN")}</td>
        <td class="px-6 py-4 text-emerald-400 font-bold">${order.totalAmount.toLocaleString("vi-VN")}đ</td>
        <td class="px-6 py-4">${getStatusBadge(order.status)}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
  }
}

// Lấy nhãn trạng thái đơn hàng dạng màu sắc
function getStatusBadge(status) {
  const badgeMap = {
    pending: '<span class="px-2.5 py-1 text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full">Chờ duyệt</span>',
    processing: '<span class="px-2.5 py-1 text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">Đang xử lý</span>',
    shipped: '<span class="px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">Đã giao</span>',
    cancelled: '<span class="px-2.5 py-1 text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 rounded-full">Đã hủy</span>',
  };
  return badgeMap[status] || status;
}

// Vẽ biểu đồ Chart.js
function renderSalesChart(monthlySalesData) {
  const ctx = document.getElementById("sales-chart").getContext("2d");

  // Hủy biểu đồ cũ nếu có để tránh lỗi hiển thị đè dữ liệu
  if (salesChart) {
    salesChart.destroy();
  }

  const labels = monthlySalesData.map(item => "Tháng " + item.month);
  const revenues = monthlySalesData.map(item => item.revenue);

  salesChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Doanh thu (đ)",
          data: revenues,
          backgroundColor: "rgba(236, 72, 153, 0.6)",
          borderColor: "rgba(236, 72, 153, 1)",
          borderWidth: 1.5,
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: "#9ca3af", font: { family: "Outfit" } }
        }
      },
      scales: {
        x: {
          grid: { color: "rgba(75, 85, 99, 0.1)" },
          ticks: { color: "#9ca3af", font: { family: "Outfit" } }
        },
        y: {
          grid: { color: "rgba(75, 85, 99, 0.1)" },
          ticks: { color: "#9ca3af", font: { family: "Outfit" } }
        }
      }
    }
  });
}

// -------------------- PHẦN: QUẢN LÝ SẢN PHẨM (CRUD) --------------------
async function loadProducts() {
  const tbody = document.getElementById("products-table-body");
  tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-gray-500">Đang tải danh sách sản phẩm...</td></tr>`;

  try {
    const res = await fetch(`${API_URL}/products`);
    if (!res.ok) throw new Error("Không thể tải danh sách sản phẩm");
    const products = await res.json();

    tbody.innerHTML = "";
    if (products.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-gray-500">Chưa có sản phẩm nào. Hãy thêm sản phẩm!</td></tr>`;
      return;
    }

    products.forEach((p) => {
      const tr = document.createElement("tr");
      tr.className = "border-b border-gray-800/50 hover:bg-gray-850/10 transition-all";
      tr.innerHTML = `
        <td class="px-6 py-4">
          <img src="${p.image || "https://via.placeholder.com/60"}" class="w-12 h-12 object-cover rounded-lg border border-gray-800" onerror="this.src='https://via.placeholder.com/60'">
        </td>
        <td class="px-6 py-4 font-semibold text-white truncate max-w-[200px]">${p.name}</td>
        <td class="px-6 py-4 text-gray-400">${p.oldPrice.toLocaleString("vi-VN")}đ</td>
        <td class="px-6 py-4 text-pink-400 font-bold">${p.newPrice.toLocaleString("vi-VN")}đ</td>
        <td class="px-6 py-4">
          <span class="bg-pink-500/10 text-pink-400 px-2.5 py-0.5 rounded-full text-xs font-semibold">-${p.discount}%</span>
        </td>
        <td class="px-6 py-4">
          ${p.stock === 0 ? '<span class="text-red-500 font-semibold text-xs bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/20">Hết hàng</span>' : `<span class="text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 text-xs">${p.stock} đôi</span>`}
        </td>
        <td class="px-6 py-4 text-gray-500 truncate max-w-xs">${p.description || "Chưa có mô tả"}</td>
        <td class="px-6 py-4 text-right space-x-2">
          <button onclick='editProduct(${JSON.stringify(p).replace(/'/g, "&apos;")})'
                  class="bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/20 py-1.5 px-3 rounded-lg text-xs font-medium transition-all">
            Sửa
          </button>
          <button onclick="deleteProduct('${p._id}')"
                  class="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 py-1.5 px-3 rounded-lg text-xs font-medium transition-all">
            Xóa
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-red-500">Đã xảy ra lỗi: ${err.message}</td></tr>`;
  }
}

// Tự động tính phần trăm giảm giá khi nhập giá trị cũ & mới
function calculateDiscount() {
  const oldPrice = parseFloat(document.getElementById("product-oldPrice").value) || 0;
  const newPrice = parseFloat(document.getElementById("product-newPrice").value) || 0;
  const discountInput = document.getElementById("product-discount");

  if (oldPrice > 0 && newPrice > 0 && oldPrice >= newPrice) {
    const pct = Math.round(((oldPrice - newPrice) / oldPrice) * 100);
    discountInput.value = pct > 0 ? pct : 0;
  } else {
    discountInput.value = 0;
  }
}

// Mở modal thêm/sửa sản phẩm
function openProductModal() {
  document.getElementById("product-modal-title").innerText = "Thêm sản phẩm mới";
  document.getElementById("product-id").value = "";
  document.getElementById("product-form").reset();
  document.getElementById("product-stock").value = "10";
  document.getElementById("product-modal").classList.remove("hidden");
}

function closeProductModal() {
  document.getElementById("product-modal").classList.add("hidden");
}

// Bắt đầu chỉnh sửa sản phẩm
function editProduct(product) {
  document.getElementById("product-modal-title").innerText = "Sửa thông tin sản phẩm";
  document.getElementById("product-id").value = product._id;
  document.getElementById("product-name").value = product.name;
  document.getElementById("product-oldPrice").value = product.oldPrice;
  document.getElementById("product-newPrice").value = product.newPrice;
  document.getElementById("product-discount").value = product.discount;
  document.getElementById("product-image").value = product.image;
  document.getElementById("product-description").value = product.description;
  document.getElementById("product-stock").value = product.stock !== undefined ? product.stock : 0;

  document.getElementById("product-modal").classList.remove("hidden");
}

// Gửi form thêm hoặc cập nhật sản phẩm
async function handleProductSubmit(e) {
  e.preventDefault();
  const token = localStorage.getItem("adminToken");

  const id = document.getElementById("product-id").value;
  const name = document.getElementById("product-name").value.trim();
  const oldPrice = parseFloat(document.getElementById("product-oldPrice").value);
  const newPrice = parseFloat(document.getElementById("product-newPrice").value);
  const discount = parseInt(document.getElementById("product-discount").value) || 0;
  const image = document.getElementById("product-image").value.trim();
  const description = document.getElementById("product-description").value.trim();
  const stock = parseInt(document.getElementById("product-stock").value) || 0;

  const payload = { name, oldPrice, newPrice, discount, image, description, stock };

  const url = id ? `${API_URL}/products/${id}` : `${API_URL}/products`;
  const method = id ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Lỗi lưu sản phẩm.");
    }

    closeProductModal();
    loadProducts();
  } catch (err) {
    alert(err.message);
  }
}

// Xóa sản phẩm
async function deleteProduct(id) {
  if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) return;

  const token = localStorage.getItem("adminToken");
  try {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Xóa sản phẩm thất bại");

    loadProducts();
  } catch (err) {
    alert(err.message);
  }
}

// -------------------- PHẦN: QUẢN LÝ ĐƠN HÀNG --------------------
async function loadOrders() {
  const tbody = document.getElementById("orders-table-body");
  tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-gray-500">Đang tải danh sách đơn hàng...</td></tr>`;

  const token = localStorage.getItem("adminToken");

  try {
    const res = await fetch(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Không thể tải danh sách đơn hàng");
    const orders = await res.json();

    tbody.innerHTML = "";
    if (orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-gray-500">Chưa có đơn hàng nào phát sinh trên hệ thống.</td></tr>`;
      return;
    }

    orders.forEach((order) => {
      // Format sản phẩm
      const productsHTML = order.products.map(p => `
        <div class="flex items-center justify-between text-xs my-1 bg-gray-900/50 p-2 rounded border border-gray-800/40">
          <span class="text-white font-medium truncate max-w-[150px]">${p.name}</span>
          <span class="text-gray-400">x${p.quantity} (${p.price.toLocaleString("vi-VN")}đ)</span>
        </div>
      `).join("");

      // User details
      const customerName = order.userId ? order.userId.name : "Vô danh";
      const customerEmail = order.userId ? order.userId.email : "N/A";
      const customerPhone = order.userId ? order.userId.phone : "N/A";
      const customerAddress = order.userId ? order.userId.address : "Chưa khai báo địa chỉ";

      const tr = document.createElement("tr");
      tr.className = "border-b border-gray-800/50 hover:bg-gray-850/10 transition-all align-top";
      tr.innerHTML = `
        <td class="px-6 py-4 font-mono text-xs text-gray-400">#${order._id.substring(order._id.length - 8)}</td>
        <td class="px-6 py-4">
          <div class="text-white font-semibold">${customerName}</div>
          <div class="text-xs text-gray-500">${customerEmail}</div>
          <div class="text-xs text-gray-400 font-mono mt-0.5"><i class="fa-solid fa-phone mr-1"></i>${customerPhone}</div>
        </td>
        <td class="px-6 py-4 max-h-[120px] overflow-y-auto scrollbar-thin">${productsHTML}</td>
        <td class="px-6 py-4 text-xs text-gray-400 max-w-[200px] break-words">${customerAddress}</td>
        <td class="px-6 py-4 text-emerald-400 font-bold">${order.totalAmount.toLocaleString("vi-VN")}đ</td>
        <td class="px-6 py-4">${getStatusBadge(order.status)}</td>
        <td class="px-6 py-4 text-right">
          <select onchange="updateOrderStatus('${order._id}', this.value)"
                  class="bg-gray-900 border border-gray-850 hover:border-pink-500 rounded-lg text-xs py-1.5 px-2.5 text-gray-300 focus:outline-none transition cursor-pointer">
            <option value="pending" ${order.status === "pending" ? "selected" : ""}>Chờ duyệt</option>
            <option value="processing" ${order.status === "processing" ? "selected" : ""}>Đang xử lý</option>
            <option value="shipped" ${order.status === "shipped" ? "selected" : ""}>Đã giao</option>
            <option value="cancelled" ${order.status === "cancelled" ? "selected" : ""}>Đã hủy</option>
          </select>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-red-500">Đã xảy ra lỗi: ${err.message}</td></tr>`;
  }
}

// Cập nhật trạng thái đơn hàng
async function updateOrderStatus(orderId, newStatus) {
  const token = localStorage.getItem("adminToken");
  try {
    const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Cập nhật trạng thái đơn hàng thất bại");

    // Chỉ load lại tab tương ứng để mượt mà
    if (currentTab === "orders") {
      loadOrders();
    } else {
      loadDashboardStats();
    }
  } catch (err) {
    alert(err.message);
  }
}

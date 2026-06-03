// js/app.js
// Expense Tracker Application Core Logic
// Requires jQuery, Chart.js, CountUp.js, jsPDF (included via CDN in index.html)

$(document).ready(function () {
  // ------- Constants & Selectors -------
  const DEFAULT_EXPENSE_CATEGORIES = [
    "Bills & Payments",
    "Food & Dining",
    "Transportation",
    "Shopping",
    "Utilities",
    "Healthcare",
    "Education",
    "Entertainment",
    "Travel",
    "EMI/Loans",
    "Insurance",
    "Miscellaneous"
  ];
  const DEFAULT_INCOME_CATEGORIES = [
    "Salary",
    "Freelancing",
    "Business",
    "Investments",
    "Rental Income",
    "Other"
  ];
  let expenseCategories = [];
  let incomeCategories = [];
  const STORAGE_KEY = "expenseTrackerData";
  const BUDGET_KEY = "expenseTrackerMonthlyBudget";
  const EXPENSE_FALLBACK_CATEGORY = "Miscellaneous";
  const INCOME_FALLBACK_CATEGORY = "Other";
  const $balanceCard = $("#balance");
  const $incomeCard = $("#totalIncome");
  const $expenseCard = $("#totalExpense");
  const $savingsCard = $("#totalSavings");
  const $monthlyBudgetInput = $("#monthlyBudgetInput");
  const $budgetStatusText = $("#budgetStatusText");
  const $budgetBadge = $("#budgetBadge");
  const $budgetProgressBar = $("#budgetProgressBar");
  const $transactionTableBody = $("#txTableBody");
  // Updated selectors to match HTML IDs
  const $searchInput = $("#searchInput");
  const $typeFilter = $("#filterType");
  const $categoryFilter = $("#filterCategory");
  const $dateFilter = $("#filter-date");
  const $darkModeToggle = $("#darkModeToggle");
  const $toastContainer = $("#toastContainer");
  const $exportCsvBtn = $("#exportCSV");
  const $exportPdfBtn = $("#exportPDF");

  // ------- State -------
  let transactions = [];
  let charts = {};
  let darkMode = false;
  let monthlyBudget = 25000;

  // ------- Initialization -------
  loadCategories();
  loadData();
  loadBudget();
  populateCategorySelect();
  populateFilterCategory();
  initCharts();
  renderAll();
  initDarkMode();

  // ------- Data Persistence -------
  function loadCategories() {
    const storedExpense = localStorage.getItem("expenseCategoriesData");
    const storedIncome = localStorage.getItem("incomeCategoriesData");
    
    if (storedExpense) {
      try {
        expenseCategories = JSON.parse(storedExpense);
        if (!Array.isArray(expenseCategories) || expenseCategories.length === 0) {
          expenseCategories = [...DEFAULT_EXPENSE_CATEGORIES];
          localStorage.setItem("expenseCategoriesData", JSON.stringify(expenseCategories));
        }
      } catch (e) {
        expenseCategories = [...DEFAULT_EXPENSE_CATEGORIES];
        localStorage.setItem("expenseCategoriesData", JSON.stringify(expenseCategories));
      }
    } else {
      expenseCategories = [...DEFAULT_EXPENSE_CATEGORIES];
      localStorage.setItem("expenseCategoriesData", JSON.stringify(expenseCategories));
    }
    expenseCategories = normalizeExpenseCategories(expenseCategories);
    localStorage.setItem("expenseCategoriesData", JSON.stringify(expenseCategories));

    if (storedIncome) {
      try {
        incomeCategories = JSON.parse(storedIncome);
        if (!Array.isArray(incomeCategories) || incomeCategories.length === 0) {
          incomeCategories = [...DEFAULT_INCOME_CATEGORIES];
          localStorage.setItem("incomeCategoriesData", JSON.stringify(incomeCategories));
        }
      } catch (e) {
        incomeCategories = [...DEFAULT_INCOME_CATEGORIES];
        localStorage.setItem("incomeCategoriesData", JSON.stringify(incomeCategories));
      }
    } else {
      incomeCategories = [...DEFAULT_INCOME_CATEGORIES];
      localStorage.setItem("incomeCategoriesData", JSON.stringify(incomeCategories));
    }
  }

  function normalizeExpenseCategories(categories) {
    const renamed = categories.map((category) => {
      if (category === "Bill") return "Bills & Payments";
      if (category === "Other") return EXPENSE_FALLBACK_CATEGORY;
      return category;
    });
    if (!renamed.includes(EXPENSE_FALLBACK_CATEGORY)) {
      renamed.push(EXPENSE_FALLBACK_CATEGORY);
    }
    return [...new Set(renamed)];
  }

  function saveCategories() {
    localStorage.setItem("expenseCategoriesData", JSON.stringify(expenseCategories));
    localStorage.setItem("incomeCategoriesData", JSON.stringify(incomeCategories));
  }

  function loadData() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        transactions = JSON.parse(stored);
        let changed = false;
        transactions.forEach((transaction) => {
          if (transaction.type === "Expense" && transaction.category === "Bill") {
            transaction.category = "Bills & Payments";
            changed = true;
          }
          if (transaction.type === "Expense" && transaction.category === "Other") {
            transaction.category = EXPENSE_FALLBACK_CATEGORY;
            changed = true;
          }
        });
        if (changed) saveData();
      } catch (e) {
        console.error("Failed to parse stored data", e);
        transactions = [];
      }
    } else {
      transactions = [];
    }
  }

  function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }

  function loadBudget() {
    const stored = parseFloat(localStorage.getItem(BUDGET_KEY));
    monthlyBudget = !isNaN(stored) && stored > 0 ? stored : 25000;
    $monthlyBudgetInput.val(monthlyBudget);
  }

  function saveBudget() {
    localStorage.setItem(BUDGET_KEY, monthlyBudget);
  }

  // ------- Rendering -------
  function renderAll() {
    renderDashboard();
    renderTransactionTable();
    updateCharts();
  }

  function renderDashboard() {
    const totalIncome = transactions
      .filter((t) => t.type === "Income")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalExpense = transactions
      .filter((t) => t.type === "Expense")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const balance = totalIncome - totalExpense;
    const savings = balance; // Simple model: savings = remaining balance
    renderMonthlyBudget();

    // Animated counters using CountUp.js with fallback
    if (typeof CountUp !== 'undefined') {
      new CountUp($balanceCard[0], balance, { prefix: "₹" }).start();
      new CountUp($incomeCard[0], totalIncome, { prefix: "₹" }).start();
      new CountUp($expenseCard[0], totalExpense, { prefix: "₹" }).start();
      new CountUp($savingsCard[0], savings, { prefix: "₹" }).start();
    } else if (typeof window.countUp !== 'undefined' && typeof window.countUp.CountUp !== 'undefined') {
      new window.countUp.CountUp($balanceCard[0], balance, { prefix: "₹" }).start();
      new window.countUp.CountUp($incomeCard[0], totalIncome, { prefix: "₹" }).start();
      new window.countUp.CountUp($expenseCard[0], totalExpense, { prefix: "₹" }).start();
      new window.countUp.CountUp($savingsCard[0], savings, { prefix: "₹" }).start();
    } else {
      $balanceCard.text(`₹${balance.toFixed(2)}`);
      $incomeCard.text(`₹${totalIncome.toFixed(2)}`);
      $expenseCard.text(`₹${totalExpense.toFixed(2)}`);
      $savingsCard.text(`₹${savings.toFixed(2)}`);
    }
  }

  function renderTransactionTable() {
    const filtered = getFilteredTransactions();
    $transactionTableBody.empty();
    filtered.forEach((t) => {
      const row = `<tr data-index="${t.index}">
          <td>${t.title}</td>
          <td>₹${parseFloat(t.amount).toFixed(2)}</td>
          <td>${t.type}</td>
          <td>${t.category}</td>
          <td>${t.date}</td>
          <td>${t.notes || "-"}</td>
          <td>
            <button class="btn btn-sm btn-primary edit-btn">Edit</button>
            <button class="btn btn-sm btn-danger ms-1 delete-btn">Delete</button>
          </td>
        </tr>`;
      $transactionTableBody.append(row);
    });
  }

  function getFilteredTransactions() {
    const search = $searchInput.val().toLowerCase();
    const type = $typeFilter.val();
    const category = $categoryFilter.val();
    const date = $dateFilter.val();
    return transactions
      .map((t, index) => ({ ...t, index }))
      .filter((t) => {
      const matchSearch =
        t.title.toLowerCase().includes(search) ||
        t.category.toLowerCase().includes(search) ||
        t.notes?.toLowerCase().includes(search);
      // Compare type case‑insensitively (stored as Capitalized)
      const matchType = type === "all" || t.type.toLowerCase() === type;
      const matchCategory = category === "all" || t.category === category;
      const matchDate =
        !date || new Date(t.date).toISOString().slice(0, 10) === date;
      return matchSearch && matchType && matchCategory && matchDate;
      });
  }

  function getCurrentMonthExpense() {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return transactions
      .filter((t) => t.type === "Expense" && t.date && t.date.slice(0, 7) === monthKey)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  }

  function renderMonthlyBudget() {
    const spent = getCurrentMonthExpense();
    const percent = monthlyBudget > 0 ? Math.min((spent / monthlyBudget) * 100, 100) : 0;
    const remaining = monthlyBudget - spent;

    $budgetStatusText.text(`Rs. ${spent.toFixed(2)} used of Rs. ${monthlyBudget.toFixed(2)}`);
    $budgetProgressBar.css("width", `${percent}%`);
    $budgetProgressBar
      .removeClass("bg-success bg-warning bg-danger")
      .addClass(percent >= 100 ? "bg-danger" : percent >= 75 ? "bg-warning" : "bg-success");

    if (remaining < 0) {
      $budgetBadge
        .removeClass("text-bg-success text-bg-warning text-bg-danger")
        .addClass("text-bg-danger")
        .text(`Over by Rs. ${Math.abs(remaining).toFixed(2)}`);
    } else if (percent >= 75) {
      $budgetBadge
        .removeClass("text-bg-success text-bg-warning text-bg-danger")
        .addClass("text-bg-warning")
        .text("Watch Spending");
    } else {
      $budgetBadge
        .removeClass("text-bg-success text-bg-warning text-bg-danger")
        .addClass("text-bg-success")
        .text(`Rs. ${remaining.toFixed(2)} left`);
    }
  }

  // ------- Event Handlers -------
  // Add Transaction
  // Update category list when type changes
  $("#txType").on("change", function () {
    const type = $(this).val();
    const $cat = $("#txCategory");
    $cat.empty();
    const list = type === "income" ? incomeCategories : expenseCategories;
    list.forEach(cat => $cat.append(`<option value="${cat}">${cat}</option>`));
  });
  // Trigger once to set initial list
  $("#txType").trigger('change');

  // Handle Radio Toggle buttons for Type selection (Sync with hidden select)
  $(document).on('change', 'input[name="txTypeRadio"]', function () {
    const val = $(this).val();
    $('#txType').val(val).trigger('change');
  });
  
  $(document).on('change', 'input[name="editTxTypeRadio"]', function () {
    const val = $(this).val();
    $('#edit-tx-type').val(val).trigger('change');
  });

  // Ensure typeExpense is checked when resetting the form
  $("#txForm").on("reset", function () {
    setTimeout(function() {
      $("#typeExpense").prop("checked", true);
    }, 0);
  });

  $("#txForm").on("submit", function (e) {
    e.preventDefault();
      const newTx = {
      title: $("#txTitle").val().trim(),
      amount: parseFloat($("#txAmount").val()),
      // Store type with capitalized first letter for consistency
      type: $("#txType").val().charAt(0).toUpperCase() + $("#txType").val().slice(1),
      category: $("#txCategory").val(),
      date: $("#txDate").val(),
      notes: $("#txNotes").val().trim()
    };

    if (isNaN(newTx.amount) || newTx.amount <= 0) {
      showToast("Please enter a valid amount.", "danger");
      return;
    }
    transactions.push(newTx);
    saveData();
    renderAll();
    this.reset();
    showToast("Transaction added.", "success");
  });

  // Edit Transaction
  // Update category list when type changes in edit modal
  $("#edit-tx-type").on("change", function () {
    const type = $(this).val();
    const $cat = $("#edit-tx-category");
    $cat.empty();
    const list = type === "income" ? incomeCategories : expenseCategories;
    list.forEach(cat => $cat.append(`<option value="${cat}">${cat}</option>`));
  });

  $transactionTableBody.on("click", ".edit-btn", function () {
    const idx = $(this).closest("tr").data("index");
    const tx = transactions[idx];
    // Populate modal fields
    $("#edit-tx-index").val(idx);
    $("#edit-tx-title").val(tx.title);
    $("#edit-tx-amount").val(tx.amount);
    
    // Set Segmented Control radio buttons based on transaction type
    if (tx.type.toLowerCase() === "income") {
      $("#editTypeIncome").prop("checked", true);
    } else {
      $("#editTypeExpense").prop("checked", true);
    }
    
    // Trigger change to populate categories correctly
    $("#edit-tx-type").val(tx.type.toLowerCase()).trigger("change");
    $("#edit-tx-category").val(tx.category);
    
    $("#edit-tx-date").val(tx.date);
    $("#edit-tx-notes").val(tx.notes);
    const editModal = new bootstrap.Modal(document.getElementById("editTransactionModal"));
    editModal.show();
  });

  $("#edit-transaction-form").on("submit", function (e) {
    e.preventDefault();
    const idx = parseInt($("#edit-tx-index").val());
    const updated = {
      title: $("#edit-tx-title").val().trim(),
      amount: parseFloat($("#edit-tx-amount").val()),
      // Ensure edited type is stored capitalized
      type: $("#edit-tx-type").val().charAt(0).toUpperCase() + $("#edit-tx-type").val().slice(1),
      category: $("#edit-tx-category").val(),
      date: $("#edit-tx-date").val(),
      notes: $("#edit-tx-notes").val().trim(),
    };
    if (isNaN(updated.amount) || updated.amount <= 0) {
      showToast("Please enter a valid amount.", "danger");
      return;
    }
    transactions[idx] = updated;
    saveData();
    renderAll();
    const editModal = bootstrap.Modal.getInstance(document.getElementById("editTransactionModal"));
    editModal.hide();
    showToast("Transaction updated.", "success");
  });

  // Delete Transaction
  $transactionTableBody.on("click", ".delete-btn", function () {
    const idx = $(this).closest("tr").data("index");
    if (confirm("Are you sure you want to delete this transaction?")) {
      transactions.splice(idx, 1);
      saveData();
      renderAll();
      showToast("Transaction deleted.", "warning");
    }
  });

  // Filters & Search
  $searchInput.on("input", renderTransactionTable);
  $typeFilter.on("change", function(){
    renderTransactionTable();
    populateFilterCategory();
  });
  $categoryFilter.on("change", renderTransactionTable);
  $dateFilter.on("change", renderTransactionTable);
  $monthlyBudgetInput.on("input change", function () {
    const value = parseFloat($(this).val());
    if (isNaN(value) || value <= 0) {
      $(this).val(monthlyBudget);
      showToast("Please enter a valid monthly budget.", "danger");
      return;
    }
    monthlyBudget = value;
    saveBudget();
    renderMonthlyBudget();
    showToast("Monthly budget updated.", "success");
  });

  // Dark Mode
  function initDarkMode() {
    const stored = localStorage.getItem("expenseTrackerDarkMode");
    darkMode = stored === "true";
    applyDarkMode();
  }
  $darkModeToggle.on("click", function () {
    darkMode = !darkMode;
    localStorage.setItem("expenseTrackerDarkMode", darkMode);
    applyDarkMode();
  });
  function applyDarkMode() {
    if (darkMode) {
      $("html").attr("data-bs-theme", "dark");
      $("body").addClass("dark-mode");
      $darkModeToggle.html("<i class='bi bi-sun'></i> Light Mode");
    } else {
      $("html").attr("data-bs-theme", "light");
      $("body").removeClass("dark-mode");
      $darkModeToggle.html("<i class='bi bi-moon'></i> Dark Mode");
    }
  }

  // Toast Notifications
  function showToast(message, type = "info") {
    const toastId = `toast-${Date.now()}`;
    const toastHtml = `<div id="${toastId}" class="toast align-items-center text-bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>`;
    $toastContainer.append(toastHtml);
    const toastEl = new bootstrap.Toast(document.getElementById(toastId), { delay: 3000 });
    toastEl.show();
  }

  // Export Buttons
$('#exportCSV').on('click', function () {
  exportToCSV(transactions);
});
$('#exportPDF').on('click', function () {
  exportToPDF(transactions);
});

// Refresh category list each time the Add Transaction modal opens
$('#txModal').on('show.bs.modal', function () {
  populateCategorySelect();
});

// Helper functions to populate category selects
function populateCategorySelect() {
  // Initial populate based on current type
  const type = $("#txType").val();
  const $cat = $("#txCategory");
  $cat.empty();
  const list = type === "income" ? incomeCategories : expenseCategories;
  list.forEach(cat => $cat.append(`<option value="${cat}">${cat}</option>`));
}
function populateFilterCategory() {
  const $filter = $("#filterCategory");
  const selectedType = $("#filterType").val(); // values: 'all', 'income', 'expense'
  $filter.empty();
  $filter.append('<option value="all" selected>All Categories</option>');
  let combined = [];
  if (selectedType === "all" || selectedType === "income") combined = combined.concat(incomeCategories);
  if (selectedType === "all" || selectedType === "expense") combined = combined.concat(expenseCategories);
  const uniq = [...new Set(combined)];
  uniq.forEach(cat => $filter.append(`<option value="${cat}">${cat}</option>`));
}

// ------- Category CRUD Event Handlers -------
$(document).on("click", "#manageCategoriesBtn, .edit-manage-categories-btn", function (e) {
  e.preventDefault();
  let activeType = "expense";
  if ($(this).attr("id") === "manageCategoriesBtn") {
    activeType = $("#txType").val();
  } else {
    activeType = $("#edit-tx-type").val();
  }
  $("#manageCategoryType").val(activeType).trigger("change");
  
  // Hide current modal if any to avoid overlapping modal backdrops
  const currentModalEl = $(this).closest(".modal");
  if (currentModalEl.length) {
    const parentModal = bootstrap.Modal.getInstance(currentModalEl[0]);
    if (parentModal) parentModal.hide();
    
    // When category modal is closed, restore parent modal
    $("#categoryModal").one("hidden.bs.modal", function () {
      parentModal.show();
    });
  }
  
  const catModal = new bootstrap.Modal(document.getElementById("categoryModal"));
  catModal.show();
});

$("#manageCategoryType").on("change", function () {
  renderManageCategoryList();
});

function renderManageCategoryList() {
  const type = $("#manageCategoryType").val();
  const list = type === "income" ? incomeCategories : expenseCategories;
  const $container = $("#categoryListContainer");
  $container.empty();
  
  list.forEach(cat => {
    const item = `
      <li class="list-group-item d-flex justify-content-between align-items-center py-2 px-3">
        <span class="category-name fw-medium">${cat}</span>
        <div class="btn-group btn-group-sm">
          <button type="button" class="btn btn-outline-secondary edit-cat-btn" data-cat="${cat}">✏️</button>
          <button type="button" class="btn btn-outline-danger delete-cat-btn" data-cat="${cat}">🗑️</button>
        </div>
      </li>`;
    $container.append(item);
  });
}

$("#addCategoryBtn").on("click", function () {
  const val = $("#newCategoryInput").val().trim();
  if (!val) {
    showToast("Category name cannot be empty.", "danger");
    return;
  }
  const type = $("#manageCategoryType").val();
  const list = type === "income" ? incomeCategories : expenseCategories;
  
  if (list.some(c => c.toLowerCase() === val.toLowerCase())) {
    showToast("Category already exists.", "danger");
    return;
  }
  
  list.push(val);
  saveCategories();
  renderManageCategoryList();
  $("#newCategoryInput").val("");
  
  // Update select dropdowns
  populateCategorySelect();
  populateFilterCategory();
  
  // Refresh Edit modal categories if open
  const editModalEl = document.getElementById("editTransactionModal");
  if (editModalEl.classList.contains("show")) {
    const currentEditCat = $("#edit-tx-category").val();
    $("#edit-tx-type").trigger("change");
    $("#edit-tx-category").val(currentEditCat);
  }
  showToast("Category added.", "success");
});

$(document).on("click", ".delete-cat-btn", function () {
  const catToDelete = $(this).data("cat");
  const type = $("#manageCategoryType").val();
  const list = type === "income" ? incomeCategories : expenseCategories;
  const fallbackCategory = type === "income" ? INCOME_FALLBACK_CATEGORY : EXPENSE_FALLBACK_CATEGORY;
  
  if (catToDelete === fallbackCategory) {
    showToast(`Cannot delete the fallback '${fallbackCategory}' category.`, "danger");
    return;
  }

  const txTypeStr = type === "income" ? "Income" : "Expense";
  const count = transactions.filter(t => t.type === txTypeStr && t.category === catToDelete).length;
  
  let confirmMsg = `Are you sure you want to delete "${catToDelete}"?`;
  if (count > 0) {
    confirmMsg = `"${catToDelete}" is used in ${count} transaction(s). Deleting it will set their category to "${fallbackCategory}". Proceed?`;
  }
  
  if (confirm(confirmMsg)) {
    const index = list.indexOf(catToDelete);
    if (index > -1) {
      list.splice(index, 1);
    }
    
    if (!list.includes(fallbackCategory)) {
      list.push(fallbackCategory);
    }
    
    if (count > 0) {
      transactions.forEach(t => {
        if (t.type === txTypeStr && t.category === catToDelete) {
          t.category = fallbackCategory;
        }
      });
      saveData();
      renderAll();
    }
    
    saveCategories();
    renderManageCategoryList();
    
    populateCategorySelect();
    populateFilterCategory();
    
    const editModalEl = document.getElementById("editTransactionModal");
    if (editModalEl.classList.contains("show")) {
      let currentEditCat = $("#edit-tx-category").val();
      if (currentEditCat === catToDelete) {
        currentEditCat = fallbackCategory;
      }
      $("#edit-tx-type").trigger("change");
      $("#edit-tx-category").val(currentEditCat);
    }
    showToast("Category deleted.", "warning");
  }
});

$(document).on("click", ".edit-cat-btn", function () {
  const cat = $(this).data("cat");
  const $li = $(this).closest("li");
  $li.data("original-html", $li.html());
  
  $li.html(`
    <input type="text" class="form-control form-control-sm me-2 edit-cat-input" value="${cat}" required />
    <div class="btn-group btn-group-sm">
      <button type="button" class="btn btn-success save-edit-cat-btn" data-old-cat="${cat}">💾</button>
      <button type="button" class="btn btn-secondary cancel-edit-cat-btn">❌</button>
    </div>
  `);
  $li.find(".edit-cat-input").focus().select();
});

$(document).on("click", ".cancel-edit-cat-btn", function () {
  const $li = $(this).closest("li");
  $li.html($li.data("original-html"));
});

$(document).on("click", ".save-edit-cat-btn", function () {
  saveCategoryEdit($(this));
});

$(document).on("keypress", ".edit-cat-input", function (e) {
  if (e.which === 13) {
    const $li = $(this).closest("li");
    saveCategoryEdit($li.find(".save-edit-cat-btn"));
  }
});

function saveCategoryEdit($btn) {
  const oldCat = $btn.data("old-cat");
  const $li = $btn.closest("li");
  const newCat = $li.find(".edit-cat-input").val().trim();
  
  if (!newCat) {
    showToast("Category name cannot be empty.", "danger");
    return;
  }
  
  const type = $("#manageCategoryType").val();
  const list = type === "income" ? incomeCategories : expenseCategories;
  
  if (oldCat === newCat) {
    $li.html($li.data("original-html"));
    return;
  }
  
  if (list.some(c => c.toLowerCase() === newCat.toLowerCase() && c !== oldCat)) {
    showToast("Category name already exists.", "danger");
    return;
  }
  
  const index = list.indexOf(oldCat);
  if (index > -1) {
    list[index] = newCat;
  }
  
  const txTypeStr = type === "income" ? "Income" : "Expense";
  let updatedCount = 0;
  transactions.forEach(t => {
    if (t.type === txTypeStr && t.category === oldCat) {
      t.category = newCat;
      updatedCount++;
    }
  });
  
  if (updatedCount > 0) {
    saveData();
    renderAll();
  }
  
  saveCategories();
  renderManageCategoryList();
  
  populateCategorySelect();
  populateFilterCategory();
  
  const editModalEl = document.getElementById("editTransactionModal");
  if (editModalEl.classList.contains("show")) {
    let currentEditCat = $("#edit-tx-category").val();
    if (currentEditCat === oldCat) {
      currentEditCat = newCat;
    }
    $("#edit-tx-type").trigger("change");
    $("#edit-tx-category").val(currentEditCat);
  }
  showToast("Category updated.", "success");
}

  // ------- Chart.js Integration -------
  function initCharts() {
    const ctxDoughnut = document.getElementById("categoryChart").getContext("2d");
    const ctxBar = document.getElementById("monthlyChart").getContext("2d");
    const ctxLine = document.getElementById("incomeExpenseChart").getContext("2d");
    charts.categoryDoughnut = new Chart(ctxDoughnut, {
      type: "doughnut",
      data: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
      options: { plugins: { legend: { position: "bottom" } } },
    });
    charts.monthlyBar = new Chart(ctxBar, {
      type: "bar",
      data: { labels: [], datasets: [{ label: "Expense", data: [], backgroundColor: "#dc3545" }] },
      options: { responsive: true, scales: { y: { beginAtZero: true } } },
    });
    charts.incomeExpenseLine = new Chart(ctxLine, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          { label: "Income", data: [], borderColor: "#28a745", fill: false },
          { label: "Expense", data: [], borderColor: "#dc3545", fill: false },
        ],
      },
      options: { responsive: true, scales: { y: { beginAtZero: true } } },
    });
    updateCharts();
  }

  function updateCharts() {
    if (!charts.categoryDoughnut || !charts.monthlyBar || !charts.incomeExpenseLine) {
      return;
    }
    // Category Doughnut (Expense only)
    const expenseByCat = {};
    transactions.forEach((t) => {
      if (t.type === "Expense") {
        expenseByCat[t.category] = (expenseByCat[t.category] || 0) + parseFloat(t.amount);
      }
    });
    const catLabels = Object.keys(expenseByCat);
    const catData = catLabels.map((c) => expenseByCat[c]);
    const catColors = catLabels.map(() => getRandomColor());
    charts.categoryDoughnut.data.labels = catLabels;
    charts.categoryDoughnut.data.datasets[0].data = catData;
    charts.categoryDoughnut.data.datasets[0].backgroundColor = catColors;
    charts.categoryDoughnut.update();

    // Monthly Bar (Expense per month for last 12 months)
    const now = new Date();
    const months = [];
    const expensePerMonth = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months.push(key);
      expensePerMonth[key] = 0;
    }
    transactions.forEach((t) => {
      if (t.type === "Expense") {
        const m = t.date.slice(0, 7); // YYYY-MM
        if (expensePerMonth.hasOwnProperty(m)) expensePerMonth[m] += parseFloat(t.amount);
      }
    });
    const barData = months.map((m) => expensePerMonth[m] || 0);
    charts.monthlyBar.data.labels = months;
    charts.monthlyBar.data.datasets[0].data = barData;
    charts.monthlyBar.update();

    // Income vs Expense Line (monthly aggregation)
    const incomePerMonth = {};
    months.forEach((m) => {
      incomePerMonth[m] = 0;
    });
    transactions.forEach((t) => {
      const m = t.date.slice(0, 7);
      if (months.includes(m)) {
        if (t.type === "Income") incomePerMonth[m] += parseFloat(t.amount);
      }
    });
    const incomeData = months.map((m) => incomePerMonth[m] || 0);
    const expenseData = months.map((m) => expensePerMonth[m] || 0);
    charts.incomeExpenseLine.data.labels = months;
    charts.incomeExpenseLine.data.datasets[0].data = incomeData;
    charts.incomeExpenseLine.data.datasets[1].data = expenseData;
    charts.incomeExpenseLine.update();
  }

  function getRandomColor() {
    const r = Math.floor(Math.random() * 200) + 55;
    const g = Math.floor(Math.random() * 200) + 55;
    const b = Math.floor(Math.random() * 200) + 55;
    return `rgb(${r},${g},${b})`;
  }

  // ------- Export Utilities -------
  function exportToCSV(txList) {
    if (txList.length === 0) {
      showToast("No transactions to export.", "warning");
      return;
    }
    const headers = ["Title", "Amount (INR)", "Type", "Category", "Date", "Notes"];
    const rows = txList.map(t => [
      t.title,
      parseFloat(t.amount).toFixed(2),
      t.type,
      t.category,
      t.date,
      t.notes || ""
    ]);
    
    // Add UTF-8 BOM for Excel compatibility
    let csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "transactions_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV exported successfully.", "success");
  }

  function exportToPDF(txList) {
    if (txList.length === 0) {
      showToast("No transactions to export.", "warning");
      return;
    }
    
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      // Header
      doc.setFillColor(0, 109, 119); // matches primary color
      doc.rect(0, 0, 210, 40, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("Expense Tracker", 14, 25);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 33);
      
      // Summary cards data
      const totalIncome = txList
        .filter((t) => t.type === "Income")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const totalExpense = txList
        .filter((t) => t.type === "Expense")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const balance = totalIncome - totalExpense;
      
      doc.setFillColor(248, 249, 250);
      doc.rect(14, 45, 182, 18, "F");
      doc.setTextColor(33, 37, 41);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(`Total Income: Rs. ${totalIncome.toFixed(2)}`, 18, 56);
      doc.text(`Total Expense: Rs. ${totalExpense.toFixed(2)}`, 80, 56);
      doc.text(`Net Balance: Rs. ${balance.toFixed(2)}`, 142, 56);
      
      const headers = [["Title", "Amount", "Type", "Category", "Date", "Notes"]];
      const data = txList.map(t => [
        t.title,
        `Rs. ${parseFloat(t.amount).toFixed(2)}`,
        t.type,
        t.category,
        t.date,
        t.notes || ""
      ]);
      
      doc.autoTable({
        head: headers,
        body: data,
        startY: 70,
        theme: "striped",
        headStyles: { fillColor: [0, 109, 119] },
        styles: { font: "helvetica", fontSize: 9 }
      });
      
      doc.save("expense_tracker_report.pdf");
      showToast("PDF exported successfully.", "success");
    } catch (error) {
      console.error("PDF export failed:", error);
      showToast("Failed to generate PDF. Make sure library is loaded.", "danger");
    }
  }
});

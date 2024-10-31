const state = {
    currentTab: 'dashboard',
    theme: 'light',
    user: null,
    transactions: [],
    budgets: [],
    investments: [],
    goals: [],
    charts: {}
};

document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
    await loadUserData();
    setupEventListeners();
    loadUserPreferences();
    updateDashboard();
    initializeCharts();
}

async function loadUserData() {
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        state.user = { name: 'John Doe', email: 'john@example.com' };
        state.transactions = [
            { id: 1, date: '2023-05-01', description: 'Salary', category: 'Income', amount: 5000 },
            { id: 2, date: '2023-05-02', description: 'Rent', category: 'Housing', amount: -1500 },
            { id: 3, date: '2023-05-03', description: 'Groceries', category: 'Food', amount: -200 },
        ];
        state.budgets = [
            { category: 'Housing', limit: 2000 },
            { category: 'Food', limit: 500 },
            { category: 'Entertainment', limit: 300 },
        ];
        state.investments = [
            { name: 'Stock A', value: 10000, growth: 5.2 },
            { name: 'Stock B', value: 5000, growth: -2.1 },
        ];
        state.goals = [
            { name: 'Emergency Fund', target: 10000, current: 5000 },
            { name: 'Vacation', target: 5000, current: 2000 },
        ];
        updateUserInfo();
    } catch (error) {
        console.error('Error loading user data:', error);
        showNotification('Failed to load user data. Please try again.', 'error');
    }
}

function setupEventListeners() {
    document.querySelectorAll('.nav-links li').forEach(link => {
        link.addEventListener('click', () => changeTab(link.dataset.tab));
    });

    document.getElementById('theme-switch').addEventListener('change', toggleTheme);
    document.getElementById('sidebar-toggle').addEventListener('click', toggleSidebar);
    window.addEventListener('resize', handleResize);

    document.getElementById('transaction-form').addEventListener('submit', handleTransactionSubmit);
    document.getElementById('budget-form').addEventListener('submit', handleBudgetSubmit);
    document.getElementById('investment-form').addEventListener('submit', handleInvestmentSubmit);
    document.getElementById('goal-form').addEventListener('submit', handleGoalSubmit);
    document.getElementById('user-settings-form').addEventListener('submit', handleSettingsSubmit);

    document.getElementById('export-data').addEventListener('click', exportData);
    document.getElementById('import-data').addEventListener('click', () => document.getElementById('import-file').click());
    document.getElementById('import-file').addEventListener('change', importData);

    document.getElementById('generate-report').addEventListener('click', generateReport);
    document.getElementById('download-report').addEventListener('click', downloadReport);
}

function loadUserPreferences() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    state.theme = savedTheme;
    document.body.classList.toggle('dark-mode', savedTheme === 'dark');
    document.getElementById('theme-switch').checked = savedTheme === 'dark';
}

function changeTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');

    document.querySelectorAll('.nav-links li').forEach(link => link.classList.remove('active'));
    document.querySelector(`.nav-links li[data-tab="${tabName}"]`).classList.add('active');

    state.currentTab = tabName;
    updateTabContent(tabName);
}

function updateTabContent(tabName) {
    switch (tabName) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'transactions':
            updateTransactions();
            break;
        case 'budget':
            updateBudget();
            break;
        case 'investments':
            updateInvestments();
            break;
        case 'goals':
            updateGoals();
            break;
        case 'reports':
            updateReports();
            break;
        case 'settings':
            updateSettings();
            break;
    }
}

function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', state.theme);
}

function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('collapsed');
    document.querySelector('.content').classList.toggle('expanded');
}

function handleResize() {
    if (window.innerWidth <= 1024) {
        document.querySelector('.sidebar').classList.add('collapsed');
        document.querySelector('.content').classList.add('expanded');
    } else {
        document.querySelector('.sidebar').classList.remove('collapsed');
        document.querySelector('.content').classList.remove('expanded');
    }
}

function updateUserInfo() {
    document.getElementById('user-name').textContent = state.user.name;
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function updateDashboard() {
    updateFinancialOverview();
    updateRecentTransactions();
    updateDashboardChart();
}

function updateFinancialOverview() {
    const totalBalance = state.transactions.reduce((sum, t) => sum + t.amount, 0);
    const income = state.transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const expenses = state.transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const savings = income - expenses;

    document.querySelector('#total-balance p').textContent = formatCurrency(totalBalance);
    document.querySelector('#income p').textContent = formatCurrency(income);
    document.querySelector('#expenses p').textContent = formatCurrency(expenses);
    document.querySelector('#savings p').textContent = formatCurrency(savings);

    updateTrend('#total-balance .trend', 3.5);
    updateTrend('#income .trend', 2.1);
    updateTrend('#expenses .trend', -1.8);
    updateTrend('#savings .trend', 4.2);
}

function updateTrend(selector, percentage) {
    const trendElement = document.querySelector(selector);
    trendElement.classList.toggle('positive', percentage >= 0);
    trendElement.classList.toggle('negative', percentage < 0);
    trendElement.querySelector('i').className = percentage >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
    trendElement.querySelector('span').textContent = `${Math.abs(percentage).toFixed(1)}%`;
}

function updateRecentTransactions() {
    const tableBody = document.querySelector('#recent-transactions tbody');
    tableBody.innerHTML = '';
    state.transactions.slice(0, 5).forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${transaction.date}</td>
            <td>${transaction.description}</td>
            <td>${transaction.category}</td>
            <td>${formatCurrency(transaction.amount)}</td>
        `;
        tableBody.appendChild(row);
    });
}

function updateDashboardChart() {
    const ctx = document.getElementById('finance-chart').getContext('2d');
    if (state.charts.dashboard) {
        state.charts.dashboard.destroy();
    }
    state.charts.dashboard = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Income',
                data: [1000, 1500, 2000, 1800, 2200, 2500],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }, {
                label: 'Expenses',
                data: [900, 1200, 1800, 1600, 2000, 2200],
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Income vs Expenses'
                }
            }
        }
    });
}

function updateTransactions() {
    updateTransactionTable();
    populateTransactionCategories();
}

function updateTransactionTable() {
    const tableBody = document.querySelector('#transactions-table tbody');
    tableBody.innerHTML = '';
    state.transactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${transaction.date}</td>
            <td>${transaction.description}</td>
            <td>${transaction.category}</td>
            <td>${formatCurrency(transaction.amount)}</td>
            <td>
                <button class="edit-transaction" data-id="${transaction.id}">Edit</button>
                <button class="delete-transaction" data-id="${transaction.id}">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    document.querySelectorAll('.edit-transaction').forEach(button => {
        button.addEventListener('click', () => editTransaction(button.dataset.id));
    });
    document.querySelectorAll('.delete-transaction').forEach(button => {
        button.addEventListener('click', () => deleteTransaction(button.dataset.id));
    });
}

function populateTransactionCategories() {
    const categorySelect = document.getElementById('transaction-category');
    const categories = [...new Set(state.transactions.map(t => t.category))];
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

function handleTransactionSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const newTransaction = {
        id: Date.now(),
        date: form.elements['transaction-date'].value,
        description: form.elements['transaction-description'].value,
        category: form.elements['transaction-category'].value,
        amount: parseFloat(form.elements['transaction-amount'].value)
    };
    state.transactions.push(newTransaction);
    updateTransactions();
    updateDashboard();
    form.reset();
    showNotification('Transaction added successfully', 'success');
}

function editTransaction(id) {
    const transaction = state.transactions.find(t => t.id === parseInt(id));
    if (transaction) {
        const form = document.getElementById('transaction-form');
        form.elements['transaction-date'].value = transaction.date;
        form.elements['transaction-description'].value = transaction.description;
        form.elements['transaction-category'].value = transaction.category;
        form.elements['transaction-amount'].value = transaction.amount;
        form.onsubmit = (event) => {
            event.preventDefault();
            transaction.date = form.elements['transaction-date'].value;
            transaction.description = form.elements['transaction-description'].value;
            transaction.category = form.elements['transaction-category'].value;
            transaction.amount = parseFloat(form.elements['transaction-amount'].value);
            updateTransactions();
            updateDashboard();
            form.reset();
            form.onsubmit = handleTransactionSubmit;
            showNotification('Transaction updated successfully', 'success');
        };
    }
}

function deleteTransaction(id) {
    state.transactions = state.transactions.filter(t => t.id !== parseInt(id));
    updateTransactions();
    updateDashboard();
    showNotification('Transaction deleted successfully', 'success');
}

function updateBudget() {
    updateBudgetTable();
    updateBudgetChart();
    populateBudgetCategories();
}

function updateBudgetTable() {
    const tableBody = document.querySelector('#budget-table tbody');
    tableBody.innerHTML = '';
    state.budgets.forEach(budget => {
        const spent = state.transactions
            .filter(t => t.category === budget.category && t.amount < 0)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const remaining = budget.limit - spent;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${budget.category}</td>
            <td>${formatCurrency(budget.limit)}</td>
            <td>${formatCurrency(spent)}</td>
            <td>${formatCurrency(remaining)}</td>
        `;
        tableBody.appendChild(row);
    });
}

function updateBudgetChart() {
    const ctx = document.getElementById('budget-chart').getContext('2d');
    if (state.charts.budget) {
        state.charts.budget.destroy();
    }
    const categories = state.budgets.map(b => b.category);
    const limits = state.budgets.map(b => b.limit);
    const spent = state.budgets.map(b => {
        return state.transactions
            .filter(t => t.category === b.category && t.amount < 0)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    });
    state.charts.budget = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [{
                label: 'Budget Limit',
                data: limits,
                backgroundColor: 'rgba(75, 192, 192, 0.6)'
            }, {
                label: 'Spent',
                data: spent,
                backgroundColor: 'rgba(255, 99, 132, 0.6)'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Budget Overview'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function populateBudgetCategories() {
    const categorySelect = document.getElementById('budget-category');
    const categories = [...new Set(state.transactions.map(t => t.category))];
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

function handleBudgetSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const category = form.elements['budget-category'].value;
    const limit = parseFloat(form.elements['budget-limit'].value);
    const existingBudgetIndex = state.budgets.findIndex(b => b.category === category);
    if (existingBudgetIndex !== -1) {
        state.budgets[existingBudgetIndex].limit = limit;
    } else {
        state.budgets.push({ category, limit });
    }
    updateBudget();
    form.reset();
    showNotification('Budget updated successfully', 'success');
}

function updateInvestments() {
    updateInvestmentTable();
    updateInvestmentChart();
}

function updateInvestmentTable() {
    const tableBody = document.querySelector('#investments-table tbody');
    tableBody.innerHTML = '';
    state.investments.forEach(investment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${investment.name}</td>
            <td>${formatCurrency(investment.value)}</td>
            <td>${investment.growth.toFixed(2)}%</td>
            <td>
                <button class="edit-investment" data-name="${investment.name}">Edit</button>
                <button class="delete-investment" data-name="${investment.name}">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    document.querySelectorAll('.edit-investment').forEach(button => {
        button.addEventListener('click', () => editInvestment(button.dataset.name));
    });
    document.querySelectorAll('.delete-investment').forEach(button => {
        button.addEventListener('click', () => deleteInvestment(button.dataset.name));
    });
}

function updateInvestmentChart() {
    const ctx = document.getElementById('investment-chart').getContext('2d');
    if (state.charts.investment) {
        state.charts.investment.destroy();
    }
    const names = state.investments.map(i => i.name);
    const values = state.investments.map(i => i.value);
    state.charts.investment = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: names,
            datasets: [{
                data: values,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Investment Portfolio'
                }
            }
        }
    });
}

function handleInvestmentSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const newInvestment = {
        name: form.elements['investment-name'].value,
        value: parseFloat(form.elements['investment-value'].value),
        growth: parseFloat(form.elements['investment-growth'].value)
    };
    const existingIndex = state.investments.findIndex(i => i.name === newInvestment.name);
    if (existingIndex !== -1) {
        state.investments[existingIndex] = newInvestment;
    } else {
        state.investments.push(newInvestment);
    }
    updateInvestments();
    form.reset();
    showNotification('Investment updated successfully', 'success');
}

function editInvestment(name) {
    const investment = state.investments.find(i => i.name === name);
    if (investment) {
        const form = document.getElementById('investment-form');
        form.elements['investment-name'].value = investment.name;
        form.elements['investment-value'].value = investment.value;
        form.elements['investment-growth'].value = investment.growth;
        form.onsubmit = handleInvestmentSubmit;
    }
}

function deleteInvestment(name) {
    state.investments = state.investments.filter(i => i.name !== name);
    updateInvestments();
    showNotification('Investment deleted successfully', 'success');
}

function updateGoals() {
    const goalsContainer = document.getElementById('goals-container');
    goalsContainer.innerHTML = '';
    state.goals.forEach(goal => {
        const progress = (goal.current / goal.target) * 100;
        const goalElement = document.createElement('div');
        goalElement.className = 'goal';
        goalElement.innerHTML = `
            <h3>${goal.name}</h3>
            <p>Target: ${formatCurrency(goal.target)}</p>
            <p>Current: ${formatCurrency(goal.current)}</p>
            <div class="progress-bar">
                <div class="progress" style="width: ${progress}%"></div>
            </div>
            <p>${progress.toFixed(2)}% complete</p>
            <button class="edit-goal" data-name="${goal.name}">Edit</button>
            <button class="delete-goal" data-name="${goal.name}">Delete</button>
        `;
        goalsContainer.appendChild(goalElement);
    });

    document.querySelectorAll('.edit-goal').forEach(button => {
        button.addEventListener('click', () => editGoal(button.dataset.name));
    });
    document.querySelectorAll('.delete-goal').forEach(button => {
        button.addEventListener('click', () => deleteGoal(button.dataset.name));
    });
}

function handleGoalSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const newGoal = {
        name: form.elements['goal-name'].value,
        target: parseFloat(form.elements['goal-target'].value),
        current: parseFloat(form.elements['goal-current'].value)
    };
    const existingIndex = state.goals.findIndex(g => g.name === newGoal.name);
    if (existingIndex !== -1) {
        state.goals[existingIndex] = newGoal;
    } else {
        state.goals.push(newGoal);
    }
    updateGoals();
    form.reset();
    showNotification('Goal updated successfully', 'success');
}

function editGoal(name) {
    const goal = state.goals.find(g => g.name === name);
    if (goal) {
        const form = document.getElementById('goal-form');
        form.elements['goal-name'].value = goal.name;
        form.elements['goal-target'].value = goal.target;
        form.elements['goal-current'].value = goal.current;
        form.onsubmit = handleGoalSubmit;
    }
}

function deleteGoal(name) {
    state.goals = state.goals.filter(g => g.name !== name);
    updateGoals();
    showNotification('Goal deleted successfully', 'success');
}

function generateReport() {
    const reportType = document.getElementById('report-type').value;
    const startDate = document.getElementById('report-start-date').value;
    const endDate = document.getElementById('report-end-date').value;

    const filteredTransactions = state.transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= new Date(startDate) && transactionDate <= new Date(endDate);
    });

    const reportContainer = document.getElementById('report-container');
    reportContainer.innerHTML = '';

    switch (reportType) {
        case 'income-expense':
            generateIncomeExpenseReport(filteredTransactions, reportContainer);
            break;
        case 'category-breakdown':
            generateCategoryBreakdownReport(filteredTransactions, reportContainer);
            break;
        case 'net-worth':
            generateNetWorthReport(reportContainer);
            break;
    }
}

function generateIncomeExpenseReport(transactions, container) {
    const income = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const netIncome = income - expenses;

    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Income', 'Expenses', 'Net Income'],
            datasets: [{
                data: [income, expenses, netIncome],
                backgroundColor: ['rgba(75, 192, 192, 0.8)', 'rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Income vs Expenses Report'
                }
            }
        }
    });
}

function generateCategoryBreakdownReport(transactions, container) {
    const categories = {};
    transactions.forEach(t => {
        if (t.amount < 0) {
            categories[t.category] = (categories[t.category] || 0) + Math.abs(t.amount);
        }
    });

    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    new Chart(canvas.getContext('2d'), {
        type: 'pie',
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Expense Category Breakdown'
                }
            }
        }
    });
}

function generateNetWorthReport(container) {
    const assets = state.investments.reduce((sum, i) => sum + i.value, 0);
    const liabilities = 0; // Assuming no liabilities for simplicity
    const netWorth = assets - liabilities;

    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    new Chart(canvas.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Assets', 'Liabilities', 'Net Worth'],
            datasets: [{
                data: [assets, liabilities, netWorth],
                backgroundColor: ['rgba(75, 192, 192, 0.8)', 'rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Net Worth Report'
                }
            }
        }
    });
}

function downloadReport() {
    showNotification('Report download started', 'info');
}

function updateSettings() {
    const form = document.getElementById('user-settings-form');
    form.elements['user-name-input'].value = state.user.name;
    form.elements['user-email-input'].value = state.user.email;
}

function handleSettingsSubmit(event) {
    event.preventDefault();
    const form = event.target;
    state.user.name = form.elements['user-name-input'].value;
    state.user.email = form.elements['user-email-input'].value;
    updateUserInfo();
    showNotification('Settings updated successfully', 'success');
}

function exportData() {
    const data = JSON.stringify(state);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'finance_data.json';
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Data exported successfully', 'success');
}

function importData(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedState = JSON.parse(e.target.result);
                Object.assign(state, importedState);
                updateDashboard();
                updateTransactions();
                updateBudget();
                updateInvestments();
                updateGoals();
                showNotification('Data imported successfully', 'success');
            } catch (error) {
                console.error('Error importing data:', error);
                showNotification('Failed to import data. Please try again.', 'error');
            }
        };
        reader.readAsText(file);
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

initApp();
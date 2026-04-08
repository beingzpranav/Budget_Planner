import os, glob

files = glob.glob('c:/Users/khand/OneDrive/Desktop/Reciept Scanner/frontend/src/pages/*.jsx')
import_statement = "import { formatCurrency, getCurrencySymbol } from '../utils';\n"

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'formatCurrency' not in content and 'ExpensesPage' in content or 'Dashboard' in content or 'BudgetPage' in content or 'AnomaliesPage' in content or 'AnalyticsPage' in content or 'ForecastPage' in content:
        lines = content.split('\n')
        # Insert after the last import
        insert_idx = 0
        for i, line in enumerate(lines):
            if line.startswith('import '):
                insert_idx = i + 1
        lines.insert(insert_idx, import_statement)
        content = '\n'.join(lines)
    
    # ExpensesPage
    content = content.replace("₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}", "{formatCurrency(total, filtered[0]?.currency)}")
    content = content.replace("₹{e.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}", "{formatCurrency(e.amount, e.currency)}")
    content = content.replace("+₹{e.tax?.toFixed(2)} tax", "+{formatCurrency(e.tax, e.currency)} tax")
    content = content.replace("₹{Number(item.price || 0).toLocaleString('en-IN', {", "{formatCurrency(item.price, selectedExpense?.currency)} {/*")
    content = content.replace("minimumFractionDigits: 2,", "")
    content = content.replace("})}", "*/}")
    
    # Dashboard
    content = content.replace("₹ {p.value?.toLocaleString('en-IN')}", "{formatCurrency(p.value)}")
    content = content.replace("={`₹${analytics?.total_spent?.toLocaleString('en-IN') || 0}`}", "={formatCurrency(analytics?.total_spent)}")
    content = content.replace("={`₹${budget?.total_budget?.toLocaleString('en-IN') || 0}`}", "={formatCurrency(budget?.total_budget)}")
    content = content.replace("`₹${(v/1000).toFixed(0)}k`", "formatCurrency(v, 'USD', true)")
    content = content.replace("[`₹${v.toLocaleString('en-IN')}`, 'Spent']", "[formatCurrency(v), 'Spent']")
    content = content.replace("₹{d.amount?.toLocaleString('en-IN')}", "{formatCurrency(d.amount)}")
    content = content.replace("₹{cat.spent?.toLocaleString('en-IN')} / ₹{cat.limit?.toLocaleString('en-IN')}", "{formatCurrency(cat.spent)} / {formatCurrency(cat.limit)}")
    content = content.replace("₹{cat.remaining?.toLocaleString('en-IN')} left", "{formatCurrency(cat.remaining)} left")
    
    # BudgetPage
    content = content.replace("₹{cat.spent?.toLocaleString('en-IN')}", "{formatCurrency(cat.spent)}")
    content = content.replace("₹{cat.limit?.toLocaleString('en-IN')}", "{formatCurrency(cat.limit)}")
    content = content.replace("`₹${cat.remaining?.toLocaleString('en-IN')} left`", "`${formatCurrency(cat.remaining)} left`")
    content = content.replace("'Over by ₹' + Math.abs(cat.limit - cat.spent)?.toLocaleString('en-IN')", "`${formatCurrency(Math.abs(cat.limit - cat.spent))} Over`")
    content = content.replace("₹{budget?.total_budget?.toLocaleString('en-IN')}", "{formatCurrency(budget?.total_budget)}")
    content = content.replace("₹{budget?.total_spent?.toLocaleString('en-IN')}", "{formatCurrency(budget?.total_spent)}")
    content = content.replace("₹{budget?.total_remaining?.toLocaleString('en-IN')} remaining", "{formatCurrency(budget?.total_remaining)} remaining")
    
    # AnomaliesPage
    content = content.replace("₹{a.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}", "{formatCurrency(a.amount, a.currency)}")
    content = content.replace("₹{a.anomaly_info?.avg_transaction_amount?.toLocaleString('en-IN')}", "{formatCurrency(a.anomaly_info?.avg_transaction_amount, a.currency)}")

    # AnalyticsPage
    content = content.replace("₹{payload[0]?.value?.toLocaleString('en-IN')}", "{formatCurrency(payload[0]?.value)}")
    content = content.replace("`₹${data?.total_spent?.toLocaleString('en-IN')}`", "formatCurrency(data?.total_spent)")
    content = content.replace("`₹${data?.avg_transaction?.toFixed(2)}`", "formatCurrency(data?.avg_transaction)")
    
    # ForecastPage
    content = content.replace("`₹${(v / 1000).toFixed(0)}k`", "formatCurrency(v, 'USD', true)")
    content = content.replace("[`₹${v.toLocaleString('en-IN')}`, 'Forecast']", "[formatCurrency(v), 'Forecast']")
    content = content.replace("₹{f.forecast_amount?.toLocaleString('en-IN')}", "{formatCurrency(f.forecast_amount)}")

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print('Replacements done.')

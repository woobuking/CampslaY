import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './figma-home.css'

const moneyCards = [
  {
    icon: 'cash',
    label: 'Revenue Last Week',
    value: '$4.000.00',
    tone: 'dark',
  },
  {
    icon: 'food',
    label: 'Food Last Week',
    value: '-$100.00',
    tone: 'blue',
  },
]

const transactions = [
  {
    icon: 'salary',
    title: 'Salary',
    time: '18:27 - April 30',
    type: 'Monthly',
    amount: '$4.000,00',
    amountTone: 'dark',
  },
  {
    icon: 'groceries',
    title: 'Groceries',
    time: '17:00 - April 24',
    type: 'Pantry',
    amount: '-$100,00',
    amountTone: 'blue',
  },
  {
    icon: 'rent',
    title: 'Rent',
    time: '8:30 - April 15',
    type: 'Rent',
    amount: '-$674,40',
    amountTone: 'blue',
  },
]

function Icon({ name }) {
  const common = {
    width: '24',
    height: '24',
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': 'true',
  }

  if (name === 'bell') {
    return (
      <svg {...common}>
        <path d="M7 10.4c0-3.1 2-5.4 5-5.4s5 2.3 5 5.4v2.9l1.7 2.7H5.3L7 13.3v-2.9Z" stroke="currentColor" strokeWidth="1.6" />
        <path d="M9.6 18.1a2.6 2.6 0 0 0 4.8 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === 'cash' || name === 'salary') {
    return (
      <svg {...common}>
        <path d="m4 8 8-4 8 4-8 4-8-4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="m4 12 8 4 8-4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="m4 16 8 4 8-4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'food') {
    return (
      <svg {...common}>
        <path d="M7 4v16M10 4v6a3 3 0 0 1-6 0V4M17 4v16M17 4c2.1 1.4 3 3.4 3 6.2 0 2.2-1 3.8-3 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === 'groceries') {
    return (
      <svg {...common}>
        <path d="M6 9h12l-1.1 10H7.1L6 9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M9 9V7a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="m9 14 2 2 4-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'rent') {
    return (
      <svg {...common}>
        <path d="M4 11.5 12 5l8 6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.5 10.5V20h11v-9.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M10 20v-5h4v5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'home') {
    return (
      <svg {...common}>
        <path d="M4.5 11.5 12 5l7.5 6.5V20h-15v-8.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M9.5 20v-5h5v5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'chart') {
    return (
      <svg {...common}>
        <path d="M4 19V7M9 19V11M14 19V5M19 19v-9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M3 19h18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === 'swap') {
    return (
      <svg {...common}>
        <path d="M7 7h12l-3-3M17 17H5l3 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'profile') {
    return (
      <svg {...common}>
        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="1.7" />
        <path d="M4.5 21a7.5 7.5 0 0 1 15 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg {...common}>
      <path d="M4 8h16M4 12h16M4 16h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function Metric({ label, value, tone }) {
  return (
    <div className="metric">
      <span className="metric-label">
        <span className="metric-check" aria-hidden="true" />
        {label}
      </span>
      <strong className={`metric-value ${tone === 'blue' ? 'is-blue' : ''}`}>{value}</strong>
    </div>
  )
}

function TransactionRow({ item }) {
  return (
    <article className="transaction-row">
      <div className="transaction-icon">
        <Icon name={item.icon} />
      </div>
      <div className="transaction-main">
        <h3>{item.title}</h3>
        <p>{item.time}</p>
      </div>
      <div className="transaction-separator" />
      <p className="transaction-type">{item.type}</p>
      <div className="transaction-separator" />
      <strong className={`transaction-amount ${item.amountTone === 'blue' ? 'is-blue' : ''}`}>{item.amount}</strong>
    </article>
  )
}

function FinWiseHome() {
  return (
    <main className="finance-page">
      <section className="phone-screen" aria-label="FinWise home screen">
        <div className="status-bar" aria-label="Status bar">
          <span>16:04</span>
          <div className="status-cluster" aria-hidden="true">
            <span className="signal" />
            <span className="wifi" />
            <span className="battery" />
          </div>
        </div>

        <header className="home-header">
          <div>
            <h1>Hi, Welcome Back</h1>
            <p>Good Morning</p>
          </div>
          <button className="bell-button" aria-label="Notifications">
            <Icon name="bell" />
          </button>
        </header>

        <section className="balance-panel" aria-label="Balance summary">
          <Metric label="Total Balance" value="$7.783.00" />
          <div className="metric-divider" />
          <Metric label="Total Expense" value="-$1.187.40" tone="blue" />
        </section>

        <section className="progress-panel" aria-label="Expense progress">
          <div className="progress-track">
            <span>30%</span>
            <strong>$20.000.00</strong>
          </div>
          <p>
            <span className="metric-check" aria-hidden="true" />
            30% Of Your Expenses, Looks Good.
          </p>
        </section>

        <section className="goals-band" aria-label="Weekly savings summary">
          <div className="goals-card">
            <div className="goal-left">
              <div className="goal-ring">
                <Icon name="rent" />
              </div>
              <h2>Savings</h2>
              <p>On Goals</p>
            </div>
            <div className="goal-divider" />
            <div className="goal-stats">
              {moneyCards.map(card => (
                <div className="goal-stat" key={card.label}>
                  <Icon name={card.icon} />
                  <div>
                    <span>{card.label}</span>
                    <strong className={card.tone === 'blue' ? 'is-blue' : ''}>{card.value}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <nav className="period-tabs" aria-label="Period">
          <button>Daily</button>
          <button>Weekly</button>
          <button className="is-active">Monthly</button>
        </nav>

        <section className="transactions" aria-label="Transactions">
          {transactions.map(item => (
            <TransactionRow key={item.title} item={item} />
          ))}
        </section>

        <nav className="bottom-nav" aria-label="Main navigation">
          {['home', 'chart', 'swap', 'cash', 'profile'].map((name, index) => (
            <button className={index === 0 ? 'is-active' : ''} key={name} aria-label={name}>
              <Icon name={name} />
            </button>
          ))}
        </nav>
      </section>
    </main>
  )
}

createRoot(document.getElementById('figma-home-root')).render(
  <StrictMode>
    <FinWiseHome />
  </StrictMode>,
)

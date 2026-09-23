from pydantic import BaseModel


class PredictionRequest(BaseModel):

    business_type: str

    total_assets_value: float
    annual_turnover: float
    capacity_used_pct: float
    annual_profit: float

    inventory_period: float
    receivables_cycle: float

    inventory_planning: int
    spend_review: int
    decision_maker: int
    finances_separate: int

    cash_shortage_1y: int
    repayment_status: int

    handle_emergency: int
    plans_2y: int
    pre_invest_plan: int

    fixed_cost_pct: float
    fulltime_employees: int

    financial_statements: int
    tracks_cashflow: int
    external_investment: int
    survive_sales_drop: float

    own_savings: float

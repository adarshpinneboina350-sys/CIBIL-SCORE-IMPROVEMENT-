export type LoanType = 'HOME' | 'PERSONAL' | 'BUSINESS' | 'VEHICLE' | 'EDUCATION' | 'NONE';
export type EMIBehavior = 'CORRECT' | 'MORE' | 'LESS' | 'NONE';

export interface CreditGrowthProfile {
  startingScore: number;
  utilizationReduction: number;
  overdueCleared: boolean;
  onTimePaymentsInPeriod: number;
  inquiriesInPeriod: number;
  creditAgeYears: number;
  hasSecuredLoan: boolean;
  loanType: LoanType;
  emiPaymentBehavior: EMIBehavior;
  accountSettledNotCleared: boolean;
  creditLimitIncreased: boolean;
  appliedForLoanInLast4Months: boolean;
}

export interface GrowthAnalysisResult {
  totalIncrement: number;
  finalScore: number;
  confidence: number;
  attribution: {
    factor: string;
    impact: number;
  }[];
  keyDrivers: string[];
  interpretation: string;
}

export type LoanStatus = 'GRANTED' | 'REJECTED' | 'PENDING';

export interface LoanDecision {
  status: LoanStatus;
  reason: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

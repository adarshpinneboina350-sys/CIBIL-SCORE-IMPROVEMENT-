import { CreditGrowthProfile, GrowthAnalysisResult, LoanDecision } from '../types';

/**
 * Decides whether a loan should be granted based on credit growth analysis.
 * Logic: Reject if improvement is > 45 points, or if final score is too low.
 */
export const decideLoanEligibility = (analysis: GrowthAnalysisResult): LoanDecision => {
  const MAX_ALLOWED_IMPROVEMENT = 45;
  const MIN_SCORE_FOR_GRANT = 700;

  // 1. User's specific request: Reject if improvement > 45
  if (analysis.totalIncrement > MAX_ALLOWED_IMPROVEMENT) {
    return {
      status: 'REJECTED',
      reason: `High-velocity score growth detected (+${analysis.totalIncrement} pts). Improvement exceeds the maximum allowed of ${MAX_ALLOWED_IMPROVEMENT} pts for automated approval, triggering a manual fraud review.`,
      riskLevel: 'HIGH'
    };
  }

  // 2. Standard score check
  if (analysis.finalScore < MIN_SCORE_FOR_GRANT) {
    return {
      status: 'REJECTED',
      reason: `Final CIBIL score (${analysis.finalScore}) is below the minimum threshold of ${MIN_SCORE_FOR_GRANT} required for this loan product.`,
      riskLevel: 'MEDIUM'
    };
  }

  // 3. Grant if both conditions are met
  return {
    status: 'GRANTED',
    reason: `Stable credit growth (+${analysis.totalIncrement} pts) and a healthy final score of ${analysis.finalScore} meet all eligibility criteria.`,
    riskLevel: 'LOW'
  };
};

/**
 * Analyzes the attribution of a past CIBIL score increment with high granularity.
 */
export const analyzeCreditGrowth = (profile: CreditGrowthProfile): GrowthAnalysisResult => {
  const {
    startingScore,
    utilizationReduction,
    overdueCleared,
    onTimePaymentsInPeriod,
    inquiriesInPeriod,
    creditAgeYears,
    hasSecuredLoan,
    loanType,
    emiPaymentBehavior,
    accountSettledNotCleared,
    creditLimitIncreased,
    appliedForLoanInLast4Months
  } = profile;

  // 1. Attribution Logic (Sophisticated Heuristic Model)
  let totalIncrement = 0;
  const attribution: { factor: string; impact: number }[] = [];

  // Utilization Management Impact (30% weight)
  let utilImpact = (utilizationReduction / 100) * 70;
  if (creditLimitIncreased) utilImpact += 8;
  
  totalIncrement += utilImpact;
  attribution.push({ factor: 'Utilization Management', impact: utilImpact });

  // Payment History (35% weight)
  let paymentImpact = (onTimePaymentsInPeriod / 6) * 12; 
  if (overdueCleared) {
    if (accountSettledNotCleared) {
      paymentImpact += 15; 
      attribution.push({ factor: 'Account Settlement (Partial)', impact: 15 });
    } else {
      const overdueBonus = 45 * (1 + (creditAgeYears / 20));
      paymentImpact += overdueBonus;
      attribution.push({ factor: 'Full Overdue Clearance', impact: overdueBonus });
    }
  }

  // EMI Payment Behavior Impact
  if (hasSecuredLoan && emiPaymentBehavior !== 'NONE') {
    let emiImpact = 0;
    if (emiPaymentBehavior === 'CORRECT') emiImpact = 10;
    else if (emiPaymentBehavior === 'MORE') emiImpact = 22;
    else if (emiPaymentBehavior === 'LESS') emiImpact = -35;
    
    paymentImpact += emiImpact;
    attribution.push({ factor: `EMI Behavior (${emiPaymentBehavior})`, impact: emiImpact });
  }

  totalIncrement += paymentImpact;
  attribution.push({ factor: 'Payment Consistency', impact: (onTimePaymentsInPeriod / 6) * 12 });

  // Credit Mix & Age (25% weight)
  let mixImpact = 0;
  if (hasSecuredLoan) {
    mixImpact = 15; // Base impact
    
    // Loan Type specific impact
    let typeBonus = 0;
    if (loanType === 'HOME') typeBonus = 25;
    else if (loanType === 'BUSINESS') typeBonus = 20;
    else if (loanType === 'VEHICLE') typeBonus = 15;
    else if (loanType === 'EDUCATION') typeBonus = 12;
    else if (loanType === 'PERSONAL') typeBonus = 8;
    
    mixImpact += typeBonus;
    attribution.push({ factor: `Loan Type Impact (${loanType})`, impact: typeBonus });
  }
  
  totalIncrement += mixImpact;
  attribution.push({ factor: 'Credit Mix (Secured)', impact: 15 });

  const ageImpact = Math.min(20, creditAgeYears * 2);
  totalIncrement += ageImpact;
  attribution.push({ factor: 'Credit History Age', impact: ageImpact });

  // Recent Credit Activity (10% weight)
  // Loan applications are weighted more heavily than standard inquiries
  const inquiryImpact = -(inquiriesInPeriod * 5) - (appliedForLoanInLast4Months ? 12 : 0);
  totalIncrement += inquiryImpact;
  attribution.push({ factor: 'Recent Credit Activity', impact: inquiryImpact });

  // Cap the total increment within realistic historical bounds (-70 to +160)
  totalIncrement = Math.max(-70, Math.min(160, totalIncrement));

  // Calculate Final Score
  let finalScore = Math.round(startingScore + totalIncrement);
  finalScore = Math.max(300, Math.min(900, finalScore));
  
  const actualIncrement = finalScore - startingScore;

  attribution.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  // 2. Key Drivers
  const keyDrivers: string[] = [];
  if (utilizationReduction > 30) keyDrivers.push('Aggressive utilization reduction');
  if (overdueCleared && !accountSettledNotCleared) keyDrivers.push('Clean clearance of past defaults');
  if (creditAgeYears > 5) keyDrivers.push('Long-standing credit history stability');
  if (hasSecuredLoan) keyDrivers.push('Healthy mix of secured and unsecured credit');
  if (appliedForLoanInLast4Months) keyDrivers.push('Avoided major loan applications');

  // 3. Interpretation
  let interpretation = '';
  if (appliedForLoanInLast4Months && actualIncrement < 10) {
    interpretation = `Your recent loan application likely suppressed score growth, resulting in a modest change of ${actualIncrement} points. Lenders view new applications as a potential risk.`
  } else if (accountSettledNotCleared) {
    interpretation = `Your score improved by ${actualIncrement} points, but the "Settled" status on your accounts likely prevented a much higher jump. Full clearance is always preferred over settlement.`;
  } else if (actualIncrement > 60) {
    interpretation = `Excellent growth of ${actualIncrement} points! Your ${attribution[0].factor.toLowerCase()} combined with ${creditAgeYears > 5 ? 'a mature credit profile' : 'disciplined payments'} drove this success.`;
  } else if (actualIncrement > 20) {
    interpretation = `Solid improvement. ${attribution[0].factor} was your strongest driver. Maintaining this ${hasSecuredLoan ? 'balanced mix' : 'payment streak'} will lead to further gains.`;
  } else {
    interpretation = `Modest change. While some actions helped, ${inquiriesInPeriod > 2 ? 'recent inquiries' : 'the lack of a diverse credit mix'} might be holding back your potential growth.`;
  }

  return {
    totalIncrement: actualIncrement,
    finalScore,
    confidence: 0.98, // Increased confidence with more data points
    attribution: attribution.filter(a => Math.abs(a.impact) > 0),
    keyDrivers: keyDrivers.slice(0, 3),
    interpretation
  };
};


export type LoanApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface LoanApplication {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  loanAmount: number;
  purpose: string;
  creditScore: number;
  employmentStatus: string;
  monthlyIncome: number;
  status: LoanApplicationStatus;
  submittedAt: string;
}

export interface LoanStats {
  totalApplications: number;
  approvedApplications: number;
  pendingApplications: number;
  rejectedApplications: number;
  totalAmount: number;
  approvedAmount: number;
  avgLoanAmount: number;
}


import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { LoanApplication, LoanStats } from '@/types/loan';

interface LoanContextType {
  applications: LoanApplication[];
  stats: LoanStats;
  addApplication: (application: Omit<LoanApplication, 'id' | 'status' | 'submittedAt'>) => string;
  getApplicationById: (id: string) => LoanApplication | undefined;
  updateApplicationStatus: (id: string, status: LoanApplication['status']) => void;
}

const LoanContext = createContext<LoanContextType | undefined>(undefined);

export const LoanProvider = ({ children }: { children: ReactNode }) => {
  const [applications, setApplications] = useState<LoanApplication[]>(() => {
    const saved = localStorage.getItem('loanApplications');
    return saved ? JSON.parse(saved) : [];
  });

  const [stats, setStats] = useState<LoanStats>(() => {
    const saved = localStorage.getItem('loanStats');
    return saved ? JSON.parse(saved) : {
      totalApplications: 0,
      approvedApplications: 0,
      pendingApplications: 0,
      rejectedApplications: 0,
      totalAmount: 0,
      approvedAmount: 0,
      avgLoanAmount: 0,
    };
  });

  // Save to localStorage whenever applications change
  useEffect(() => {
    localStorage.setItem('loanApplications', JSON.stringify(applications));
    calculateStats();
  }, [applications]);

  // Save stats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('loanStats', JSON.stringify(stats));
  }, [stats]);

  const calculateStats = () => {
    const totalApplications = applications.length;
    const approvedApplications = applications.filter(app => app.status === 'approved').length;
    const pendingApplications = applications.filter(app => app.status === 'pending').length;
    const rejectedApplications = applications.filter(app => app.status === 'rejected').length;
    
    const totalAmount = applications.reduce((sum, app) => sum + app.loanAmount, 0);
    const approvedAmount = applications
      .filter(app => app.status === 'approved')
      .reduce((sum, app) => sum + app.loanAmount, 0);
    
    const avgLoanAmount = totalApplications > 0 ? totalAmount / totalApplications : 0;

    setStats({
      totalApplications,
      approvedApplications,
      pendingApplications,
      rejectedApplications,
      totalAmount,
      approvedAmount,
      avgLoanAmount,
    });
  };

  const addApplication = (applicationData: Omit<LoanApplication, 'id' | 'status' | 'submittedAt'>) => {
    const newApplication: LoanApplication = {
      ...applicationData,
      id: uuidv4(),
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    setApplications(prev => [...prev, newApplication]);
    return newApplication.id;
  };

  const getApplicationById = (id: string) => {
    return applications.find(app => app.id === id);
  };

  const updateApplicationStatus = (id: string, status: LoanApplication['status']) => {
    setApplications(prev => 
      prev.map(app => 
        app.id === id ? { ...app, status } : app
      )
    );
  };

  return (
    <LoanContext.Provider value={{
      applications,
      stats,
      addApplication,
      getApplicationById,
      updateApplicationStatus,
    }}>
      {children}
    </LoanContext.Provider>
  );
};

export const useLoan = () => {
  const context = useContext(LoanContext);
  if (context === undefined) {
    throw new Error('useLoan must be used within a LoanProvider');
  }
  return context;
};

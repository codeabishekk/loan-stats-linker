
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { LoanApplication, LoanStats } from '@/types/loan';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface LoanContextType {
  applications: LoanApplication[];
  stats: LoanStats;
  addApplication: (application: Omit<LoanApplication, 'id' | 'status' | 'submittedAt'>) => Promise<string>;
  getApplicationById: (id: string) => LoanApplication | undefined;
  updateApplicationStatus: (id: string, status: LoanApplication['status']) => Promise<void>;
  loading: boolean;
  refreshData: () => Promise<void>;
}

const LoanContext = createContext<LoanContextType | undefined>(undefined);

export const LoanProvider = ({ children }: { children: ReactNode }) => {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [stats, setStats] = useState<LoanStats>({
    totalApplications: 0,
    approvedApplications: 0,
    pendingApplications: 0,
    rejectedApplications: 0,
    totalAmount: 0,
    approvedAmount: 0,
    avgLoanAmount: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();

  // Fetch data when user changes
  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      setApplications([]);
      setStats({
        totalApplications: 0,
        approvedApplications: 0,
        pendingApplications: 0,
        rejectedApplications: 0,
        totalAmount: 0,
        approvedAmount: 0,
        avgLoanAmount: 0,
      });
      setLoading(false);
    }
  }, [user]);

  const refreshData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch applications
      const { data: appData, error: appError } = await supabase
        .from('loan_applications')
        .select('*')
        .order('submitted_at', { ascending: false });
      
      if (appError) throw appError;
      
      const formattedApps = appData.map(app => ({
        id: app.id,
        fullName: app.full_name,
        email: app.email,
        phoneNumber: app.phone_number,
        loanAmount: app.loan_amount,
        purpose: app.purpose,
        creditScore: app.credit_score,
        employmentStatus: app.employment_status,
        monthlyIncome: app.monthly_income,
        status: app.status as LoanApplication['status'],
        submittedAt: app.submitted_at
      }));
      
      setApplications(formattedApps);
      
      // Fetch or calculate stats
      await refreshStats(formattedApps);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load your data");
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async (apps: LoanApplication[]) => {
    if (!user || !apps.length) {
      setStats({
        totalApplications: 0,
        approvedApplications: 0,
        pendingApplications: 0,
        rejectedApplications: 0,
        totalAmount: 0,
        approvedAmount: 0,
        avgLoanAmount: 0,
      });
      return;
    }

    // Calculate stats from applications
    const totalApplications = apps.length;
    const approvedApplications = apps.filter(app => app.status === 'approved').length;
    const pendingApplications = apps.filter(app => app.status === 'pending').length;
    const rejectedApplications = apps.filter(app => app.status === 'rejected').length;
    
    const totalAmount = apps.reduce((sum, app) => sum + app.loanAmount, 0);
    const approvedAmount = apps
      .filter(app => app.status === 'approved')
      .reduce((sum, app) => sum + app.loanAmount, 0);
    
    const avgLoanAmount = totalApplications > 0 ? totalAmount / totalApplications : 0;

    const newStats = {
      totalApplications,
      approvedApplications,
      pendingApplications,
      rejectedApplications,
      totalAmount,
      approvedAmount,
      avgLoanAmount,
    };

    setStats(newStats);

    // Update stats in database
    try {
      // Check if stats entry exists
      const { data: existingStats } = await supabase
        .from('loan_stats')
        .select('*')
        .single();
      
      if (existingStats) {
        // Update existing stats
        await supabase
          .from('loan_stats')
          .update({
            total_applications: totalApplications,
            approved_applications: approvedApplications,
            pending_applications: pendingApplications,
            rejected_applications: rejectedApplications,
            total_amount: totalAmount,
            approved_amount: approvedAmount,
            avg_loan_amount: avgLoanAmount,
          })
          .eq('user_id', user.id);
      } else {
        // Create new stats entry
        await supabase
          .from('loan_stats')
          .insert({
            user_id: user.id,
            total_applications: totalApplications,
            approved_applications: approvedApplications,
            pending_applications: pendingApplications,
            rejected_applications: rejectedApplications,
            total_amount: totalAmount,
            approved_amount: approvedAmount,
            avg_loan_amount: avgLoanAmount,
          });
      }
    } catch (error) {
      console.error("Error updating stats:", error);
    }
  };

  const addApplication = async (applicationData: Omit<LoanApplication, 'id' | 'status' | 'submittedAt'>) => {
    if (!user) throw new Error("You must be logged in to submit an application");
    
    try {
      // Insert into Supabase
      const { data, error } = await supabase
        .from('loan_applications')
        .insert({
          user_id: user.id,
          full_name: applicationData.fullName,
          email: applicationData.email,
          phone_number: applicationData.phoneNumber,
          loan_amount: applicationData.loanAmount,
          purpose: applicationData.purpose,
          credit_score: applicationData.creditScore,
          employment_status: applicationData.employmentStatus,
          monthly_income: applicationData.monthlyIncome,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Format the data to match our app's structure
      const newApplication: LoanApplication = {
        id: data.id,
        fullName: data.full_name,
        email: data.email,
        phoneNumber: data.phone_number,
        loanAmount: data.loan_amount,
        purpose: data.purpose,
        creditScore: data.credit_score,
        employmentStatus: data.employment_status,
        monthlyIncome: data.monthly_income,
        status: data.status as LoanApplication['status'],
        submittedAt: data.submitted_at
      };

      // Update local state
      setApplications(prev => [newApplication, ...prev]);
      
      // Recalculate stats
      await refreshStats([newApplication, ...applications]);
      
      return newApplication.id;
    } catch (error) {
      console.error("Error adding application:", error);
      throw error;
    }
  };

  const getApplicationById = (id: string) => {
    return applications.find(app => app.id === id);
  };

  const updateApplicationStatus = async (id: string, status: LoanApplication['status']) => {
    if (!user) throw new Error("You must be logged in to update an application");
    
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('loan_applications')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      const updatedApplications = applications.map(app => 
        app.id === id ? { ...app, status } : app
      );
      
      setApplications(updatedApplications);
      
      // Recalculate stats
      await refreshStats(updatedApplications);
    } catch (error) {
      console.error("Error updating application status:", error);
      throw error;
    }
  };

  return (
    <LoanContext.Provider value={{
      applications,
      stats,
      addApplication,
      getApplicationById,
      updateApplicationStatus,
      loading,
      refreshData
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

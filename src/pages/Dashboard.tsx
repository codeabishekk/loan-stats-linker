
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLoan } from '@/context/LoanContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import StatCard from '@/components/StatCard';
import ApplicationTable from '@/components/ApplicationTable';
import { LoanApplication } from '@/types/loan';
import DashboardHeader from '@/components/DashboardHeader';

const Dashboard = () => {
  const { applications, stats } = useLoan();
  const [activeTab, setActiveTab] = useState('overview');
  
  const statusData = [
    { name: 'Approved', value: stats.approvedApplications, color: '#10B981' },
    { name: 'Pending', value: stats.pendingApplications, color: '#F59E0B' },
    { name: 'Rejected', value: stats.rejectedApplications, color: '#EF4444' },
  ];

  const amountData = applications.map(app => ({
    name: app.fullName.split(' ')[0],
    amount: app.loanAmount,
    status: app.status
  }));

  // Group applications by day for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const applicationsByDay: {[key: string]: number} = {};
  applications.forEach(app => {
    const date = new Date(app.submittedAt);
    if (date >= thirtyDaysAgo) {
      const dateStr = date.toISOString().split('T')[0];
      applicationsByDay[dateStr] = (applicationsByDay[dateStr] || 0) + 1;
    }
  });

  const trendsData = Object.entries(applicationsByDay).map(([date, count]) => ({
    date,
    applications: count
  })).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="bg-gray-50 min-h-screen">
      <DashboardHeader />
      
      <div className="container mx-auto p-4 lg:p-8">
        <div className="flex flex-col lg:flex-row justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Loan Dashboard</h1>
            <p className="text-gray-500">Monitor loan applications and key metrics</p>
          </div>
          <Link to="/apply">
            <Button className="mt-4 lg:mt-0 bg-blue-600 hover:bg-blue-700">
              New Application
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Total Applications" 
            value={stats.totalApplications} 
            description="All time"
            trend={+5}
            icon="file-text"
          />
          <StatCard 
            title="Total Amount" 
            value={formatCurrency(stats.totalAmount)} 
            description="All applications"
            trend={+8}
            icon="dollar-sign"
          />
          <StatCard 
            title="Approval Rate" 
            value={`${stats.totalApplications ? Math.round((stats.approvedApplications / stats.totalApplications) * 100) : 0}%`} 
            description="Applications approved"
            trend={-2}
            icon="check-circle"
          />
          <StatCard 
            title="Average Loan" 
            value={formatCurrency(stats.avgLoanAmount)} 
            description="Per application"
            trend={+3}
            icon="trending-up"
          />
        </div>
        
        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Application Status</CardTitle>
                  <CardDescription>Distribution of application statuses</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} applications`, 'Count']} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Loan Amounts</CardTitle>
                  <CardDescription>Recent application amounts</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={amountData.slice(-10)}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Amount']} />
                      <Bar 
                        dataKey="amount" 
                        fill="#3B82F6" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>Latest loan applications</CardDescription>
              </CardHeader>
              <ApplicationTable 
                applications={applications.slice(-5)}
                compact={true}
              />
            </Card>
          </TabsContent>
          
          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>All Applications</CardTitle>
                <CardDescription>Complete list of loan applications</CardDescription>
              </CardHeader>
              <ApplicationTable applications={applications} />
            </Card>
          </TabsContent>
          
          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Application Trends</CardTitle>
                <CardDescription>Applications over time (last 30 days)</CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendsData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="applications" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;

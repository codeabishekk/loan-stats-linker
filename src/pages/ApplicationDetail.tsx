
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useLoan } from "@/context/LoanContext";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import DashboardHeader from "@/components/DashboardHeader";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";

const ApplicationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getApplicationById, updateApplicationStatus } = useLoan();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const application = getApplicationById(id || "");
  
  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Application Not Found</h1>
          <p className="text-gray-600 mb-6">
            The application you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleStatusUpdate = async (status: "approved" | "rejected") => {
    setIsUpdating(true);
    
    try {
      // Simulate API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateApplicationStatus(application.id, status);
      
      const message = status === "approved" 
        ? "Application approved successfully!" 
        : "Application rejected.";
      
      toast.success(message);
    } catch (error) {
      toast.error("Failed to update application status. Please try again.");
      console.error("Application status update error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <DashboardHeader />
      
      <div className="container mx-auto p-4 lg:p-8">
        <div className="mb-6">
          <Link to="/dashboard" className="text-blue-600 hover:text-blue-800 inline-flex items-center mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Application Details</h1>
              <div className="flex items-center mt-2">
                <p className="text-gray-500 mr-3">Submitted {formatDate(application.submittedAt)}</p>
                {getStatusBadge(application.status)}
              </div>
            </div>
            
            {application.status === "pending" && (
              <div className="flex space-x-3 mt-4 sm:mt-0">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isUpdating}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reject Application</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to reject this loan application? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleStatusUpdate("rejected")}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Reject
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700" disabled={isUpdating}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Approve Application</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to approve this loan application for {formatCurrency(application.loanAmount)}?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleStatusUpdate("approved")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Applicant Information</CardTitle>
                <CardDescription>Personal details and loan request information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Personal Details</h3>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium w-1/3">Full Name</TableCell>
                          <TableCell>{application.fullName}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Email</TableCell>
                          <TableCell>{application.email}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Phone</TableCell>
                          <TableCell>{application.phoneNumber}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Credit Score</TableCell>
                          <TableCell>{application.creditScore}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Loan Information</h3>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium w-1/3">Amount</TableCell>
                          <TableCell className="font-semibold">{formatCurrency(application.loanAmount)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Purpose</TableCell>
                          <TableCell>{application.purpose}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Employment</TableCell>
                          <TableCell>{application.employmentStatus}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Monthly Income</TableCell>
                          <TableCell>{formatCurrency(application.monthlyIncome)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                {application.status === "approved" && (
                  <div className="mt-8 bg-green-50 border border-green-100 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="mr-3 bg-green-100 rounded-full p-1">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-green-800">Application Approved</h3>
                        <p className="text-green-700 text-sm mt-1">
                          This application has been approved for {formatCurrency(application.loanAmount)}.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {application.status === "rejected" && (
                  <div className="mt-8 bg-red-50 border border-red-100 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="mr-3 bg-red-100 rounded-full p-1">
                        <XCircle className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-red-800">Application Rejected</h3>
                        <p className="text-red-700 text-sm mt-1">
                          This application has been rejected and cannot be approved in the future.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
                <CardDescription>Automated evaluation of application risk</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Simple risk assessment based on credit score and income */}
                {(() => {
                  const debtToIncomeRatio = application.loanAmount / (application.monthlyIncome * 12);
                  
                  let riskLevel;
                  let riskColor;
                  let recommendations = [];
                  
                  // Determine risk level
                  if (application.creditScore >= 750 && debtToIncomeRatio < 0.3) {
                    riskLevel = "Low";
                    riskColor = "green";
                    recommendations.push("Excellent candidate for approval");
                  } else if (application.creditScore >= 650 && debtToIncomeRatio < 0.4) {
                    riskLevel = "Moderate";
                    riskColor = "yellow";
                    recommendations.push("Consider approval with standard terms");
                  } else if (application.creditScore >= 600 && debtToIncomeRatio < 0.5) {
                    riskLevel = "Medium";
                    riskColor = "orange";
                    recommendations.push("Consider approval with higher interest rates");
                    recommendations.push("Verify income documentation");
                  } else {
                    riskLevel = "High";
                    riskColor = "red";
                    recommendations.push("Recommend additional verification");
                    recommendations.push("Consider rejection based on risk profile");
                  }
                  
                  return (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-700 font-medium">Risk Level:</span>
                        <Badge className={`bg-${riskColor}-${riskColor === 'yellow' ? '400' : '500'}`}>
                          {riskLevel}
                        </Badge>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-gray-700 font-medium mb-2">Factors:</p>
                          <ul className="text-sm space-y-1">
                            <li className="flex justify-between">
                              <span>Credit Score</span>
                              <span className="font-medium">{application.creditScore}</span>
                            </li>
                            <li className="flex justify-between">
                              <span>Debt-to-Income Ratio</span>
                              <span className="font-medium">{(debtToIncomeRatio * 100).toFixed(1)}%</span>
                            </li>
                            <li className="flex justify-between">
                              <span>Employment Status</span>
                              <span className="font-medium">{application.employmentStatus}</span>
                            </li>
                          </ul>
                        </div>
                        
                        <div>
                          <p className="text-gray-700 font-medium mb-2">Recommendations:</p>
                          <ul className="text-sm space-y-1 list-disc pl-5">
                            {recommendations.map((rec, index) => (
                              <li key={index}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" onClick={() => window.print()}>
                    Print Application
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Export as PDF
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/dashboard")}>
                    Return to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;

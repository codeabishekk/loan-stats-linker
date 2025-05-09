
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useLoan } from "@/context/LoanContext";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import DashboardHeader from "@/components/DashboardHeader";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const formSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  loanAmount: z.number().min(1000, "Loan amount must be at least $1,000").max(100000, "Loan amount cannot exceed $100,000"),
  purpose: z.string().min(1, "Please select a loan purpose"),
  creditScore: z.number().min(300, "Credit score must be at least 300").max(850, "Credit score cannot exceed 850"),
  employmentStatus: z.string().min(1, "Please select your employment status"),
  monthlyIncome: z.number().min(1, "Monthly income is required"),
});

const ApplicationForm = () => {
  const { addApplication } = useLoan();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      loanAmount: 10000,
      purpose: "",
      creditScore: 700,
      employmentStatus: "",
      monthlyIncome: 0,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const applicationId = addApplication(values);
      
      toast.success("Application submitted successfully!");
      navigate(`/applications/${applicationId}`);
    } catch (error) {
      toast.error("Failed to submit application. Please try again.");
      console.error("Application submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const loanPurposes = [
    "Home Purchase",
    "Home Renovation",
    "Debt Consolidation",
    "Education",
    "Medical Expenses",
    "Business",
    "Vehicle Purchase",
    "Travel",
    "Wedding",
    "Other"
  ];

  const employmentStatuses = [
    "Full-time",
    "Part-time",
    "Self-employed",
    "Unemployed",
    "Retired",
    "Student"
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <DashboardHeader />
      
      <div className="container mx-auto p-4 lg:p-8">
        <div className="mb-6">
          <Link to="/dashboard" className="text-blue-600 hover:text-blue-800 inline-flex items-center mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Loan Application</h1>
          <p className="text-gray-500">Complete the form below to apply for a loan</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Please provide your personal details below
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="john@example.com" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="border-t border-gray-100 pt-6">
                      <h3 className="text-lg font-medium mb-4">Loan Details</h3>
                      
                      <FormField
                        control={form.control}
                        name="loanAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Loan Amount: ${field.value.toLocaleString()}
                            </FormLabel>
                            <FormControl>
                              <Slider
                                min={1000}
                                max={100000}
                                step={1000}
                                defaultValue={[field.value]}
                                onValueChange={(values) => field.onChange(values[0])}
                              />
                            </FormControl>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>$1,000</span>
                              <span>$100,000</span>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <FormField
                          control={form.control}
                          name="purpose"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Loan Purpose</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select purpose" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {loanPurposes.map((purpose) => (
                                      <SelectItem key={purpose} value={purpose}>
                                        {purpose}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="creditScore"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Credit Score: {field.value}
                              </FormLabel>
                              <FormControl>
                                <Slider
                                  min={300}
                                  max={850}
                                  step={10}
                                  defaultValue={[field.value]}
                                  onValueChange={(values) => field.onChange(values[0])}
                                />
                              </FormControl>
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>300 (Poor)</span>
                                <span>850 (Excellent)</span>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-6">
                      <h3 className="text-lg font-medium mb-4">Financial Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="employmentStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Employment Status</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {employmentStatuses.map((status) => (
                                      <SelectItem key={status} value={status}>
                                        {status}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="monthlyIncome"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Monthly Income ($)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="5000"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-6 flex justify-end">
                      <Button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Submit Application"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Application Guidelines</CardTitle>
                <CardDescription>Important information about your loan application</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-1">Eligibility Requirements</h4>
                    <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                      <li>Must be 18 years or older</li>
                      <li>Valid government-issued ID</li>
                      <li>Proof of income</li>
                      <li>Credit score of at least 600 recommended</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-1">Processing Time</h4>
                    <p className="text-sm text-gray-600">
                      Applications are typically processed within 1-3 business days. You'll receive a notification by email once your application has been reviewed.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-1">Interest Rates</h4>
                    <p className="text-sm text-gray-600">
                      Interest rates range from 5.99% to 24.99% APR based on creditworthiness and loan amount.
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg mt-6">
                    <h4 className="font-semibold text-blue-700 mb-2">Need Help?</h4>
                    <p className="text-sm text-blue-600 mb-3">
                      Our customer service team is available to assist you with any questions about your application.
                    </p>
                    <div className="text-sm">
                      <p className="flex items-center text-blue-700">
                        <span className="font-semibold mr-2">Email:</span> support@loanmanager.com
                      </p>
                      <p className="flex items-center text-blue-700 mt-1">
                        <span className="font-semibold mr-2">Phone:</span> (800) 555-0123
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;

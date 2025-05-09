
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Badge
} from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Link } from "react-router-dom";
import { LoanApplication } from "@/types/loan";
import { Button } from "./ui/button";
import { ExternalLink } from "lucide-react";

interface ApplicationTableProps {
  applications: LoanApplication[];
  compact?: boolean;
}

const ApplicationTable = ({ applications, compact = false }: ApplicationTableProps) => {
  // Sort applications by submission date (newest first)
  const sortedApplications = [...applications].sort((a, b) => 
    new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

  const getStatusBadge = (status: LoanApplication['status']) => {
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

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (applications.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">No applications found</p>
        <Link to="/apply">
          <Button variant="outline" className="mt-4">Create New Application</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/5">Applicant</TableHead>
            <TableHead className="w-1/6">Amount</TableHead>
            {!compact && <TableHead className="w-1/6">Purpose</TableHead>}
            <TableHead className="w-1/6">Date</TableHead>
            <TableHead className="w-1/6">Status</TableHead>
            <TableHead className="w-1/12 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedApplications.map((app) => (
            <TableRow key={app.id}>
              <TableCell className="font-medium">{app.fullName}</TableCell>
              <TableCell>{formatCurrency(app.loanAmount)}</TableCell>
              {!compact && <TableCell>{app.purpose}</TableCell>}
              <TableCell>{formatDate(app.submittedAt)}</TableCell>
              <TableCell>{getStatusBadge(app.status)}</TableCell>
              <TableCell className="text-right">
                <Link to={`/applications/${app.id}`}>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ApplicationTable;

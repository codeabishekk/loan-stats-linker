
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  FileText, 
  DollarSign, 
  CheckCircle, 
  TrendingUp,
  LucideIcon 
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  trend?: number;
  icon?: string;
}

const StatCard = ({ title, value, description, trend = 0, icon }: StatCardProps) => {
  const renderIcon = () => {
    switch (icon) {
      case 'file-text':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'dollar-sign':
        return <DollarSign className="h-5 w-5 text-green-600" />;
      case 'check-circle':
        return <CheckCircle className="h-5 w-5 text-teal-600" />;
      case 'trending-up':
        return <TrendingUp className="h-5 w-5 text-indigo-600" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
          </div>
          <div className="bg-gray-100 p-2 rounded-md">
            {renderIcon()}
          </div>
        </div>
        
        <div className="flex items-center mt-4">
          {trend !== 0 && (
            <div className={`flex items-center text-sm font-medium mr-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? (
                <ArrowUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 mr-1" />
              )}
              {Math.abs(trend)}%
            </div>
          )}
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;

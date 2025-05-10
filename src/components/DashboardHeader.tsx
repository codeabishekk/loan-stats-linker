
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, Bell, Search, User, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const DashboardHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      navigate("/auth");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden mr-2"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link to="/dashboard" className="flex items-center">
            <div className="bg-blue-600 text-white font-bold rounded-md w-8 h-8 flex items-center justify-center mr-2">
              LM
            </div>
            <span className="text-xl font-bold text-gray-900">LoanManager</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search applications..." 
              className="pl-8 bg-gray-50"
            />
          </div>
          <nav className="flex space-x-4">
            <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 px-2 py-1 rounded">
              Dashboard
            </Link>
            <Link to="/apply" className="text-gray-700 hover:text-blue-600 px-2 py-1 rounded">
              New Application
            </Link>
          </nav>
        </div>

        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="text-gray-600">
            <Bell className="h-5 w-5" />
          </Button>
          <div className="relative ml-2">
            <Button variant="ghost" size="icon" className="text-gray-600">
              <User className="h-5 w-5" />
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-2 text-gray-600"
            onClick={handleSignOut}
            title="Sign Out"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 p-4">
          <div className="relative mb-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search applications..." 
              className="pl-8 bg-gray-50"
            />
          </div>
          <nav className="flex flex-col space-y-2">
            <Link 
              to="/dashboard" 
              className="text-gray-700 hover:text-blue-600 px-2 py-1 rounded"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              to="/apply" 
              className="text-gray-700 hover:text-blue-600 px-2 py-1 rounded"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              New Application
            </Link>
            <Button 
              variant="ghost" 
              className="justify-start text-gray-700 hover:text-red-600 px-2 py-1"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default DashboardHeader;

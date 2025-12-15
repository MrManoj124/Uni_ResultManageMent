import React, {useState, useEffect} from 'react';
import { GraduationCap, Logout, BookOpen, Users, FileText, 
    Plus, Upload, Check, X, Search, Filter
    }  from 'lucide-react';
import { staffAPI, resultAPI, courseAPI, studentAPI, calculateGrade, handleAPIError } from '../services/api';

const StaffDashboard = ({user, onLogout})=>{
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState(null);
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [result, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddResultModal, setShoqAddResultModal] = useState(false);

    useEffect(()=>{
        fetchDashboardData();
    },[]);

    const fetchDashboardData = async () => {
        try{
            setLoading(true);
            const [dashboardData, coursesData, resultsData] =wait Promise.all([
                staffAPI.getDashboard(user.staffId),
                staffAPI.getAssignedCourses(user.staffId),
                resultAPI.getAllResults({uploadedBy:user.id})

            ]);
            setStats(dashboardData.data.stats);
            setCourses(coursesData.data.courses || []);
            setResults(resultsData.data.results || []);        }
    }catch(error){
        console.error('Error fetching dashboard data:', error);

    }finally{
        setLoading(false);
    }
}

if(loading){
    return(
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
}

return(
    <div className="min-h-screen bg-gray-50">
       {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <GraduationCap className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">ResultPro Staff</h1>
                <p className="text-indigo-100 text-sm">Staff Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-indigo-100">{user.staffId}</p>
              </div>
              <button 
                onClick={onLogout} 
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>


    </div>
)
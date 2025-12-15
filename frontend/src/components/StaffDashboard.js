import React, {useState, useEffect} from 'react';
import { GraduationCap, Logout, BookOpen, Users, FileText, 
    Plus, Upload, Check, X, Search, Filter
    }  from 'lucide-react';
import { staffAPI, resultAPI, courseAPI, studentAPI, calculateGrade, handleAPIError } from '../services/api';


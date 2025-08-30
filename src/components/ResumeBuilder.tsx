import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Eye, 
  Upload, 
  Save, 
  Plus, 
  Trash2, 
  Edit3,
  User,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  Sparkles,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { ResumeData, generateResumePDF } from '../utils/pdfGenerator';
import { resumeTemplates } from '../data/resumeTemplates';
import TemplateSelector from './TemplateSelector';
import ResumePreview from './ResumePreview';
import ResumeImporter from './ResumeImporter';
import toast from 'react-hot-toast';

const ResumeBuilder: React.FC = () => {
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
      linkedin: '',
      github: ''
    },
    experience: [],
    education: [],
    skills: [],
    projects: []
  });

  const [selectedTemplate, setSelectedTemplate] = useState('modern-1');
  const [showPreview, setShowPreview] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const [activeSection, setActiveSection] = useState<'personal' | 'experience' | 'education' | 'skills' | 'projects'>('personal');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      saveToLocalStorage();
    }, 2000);

    return () => clearTimeout(timer);
  }, [resumeData]);

  // Load data on component mount
  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  const saveToLocalStorage = () => {
    setIsSaving(true);
    try {
      localStorage.setItem('resumeData', JSON.stringify(resumeData));
      setLastSaved(new Date());
      setTimeout(() => setIsSaving(false), 500);
    } catch (error) {
      toast.error('Failed to save data');
      setIsSaving(false);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('resumeData');
      if (saved) {
        setResumeData(JSON.parse(saved));
        toast.success('Previous data loaded');
      }
    } catch (error) {
      console.error('Failed to load saved data:', error);
    }
  };

  const handlePersonalInfoChange = (field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        { title: '', company: '', duration: '', description: '' }
      ]
    }));
  };

  const updateExperience = (index: number, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        { degree: '', institution: '', year: '', gpa: '' }
      ]
    }));
  };

  const updateEducation = (index: number, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !resumeData.skills.includes(skill.trim())) {
      setResumeData(prev => ({
        ...prev,
        skills: [...prev.skills, skill.trim()]
      }));
    }
  };

  const removeSkill = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const addProject = () => {
    setResumeData(prev => ({
      ...prev,
      projects: [
        ...(prev.projects || []),
        { name: '', description: '', technologies: '', link: '' }
      ]
    }));
  };

  const updateProject = (index: number, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: (prev.projects || []).map((project, i) => 
        i === index ? { ...project, [field]: value } : project
      )
    }));
  };

  const removeProject = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      projects: (prev.projects || []).filter((_, i) => i !== index)
    }));
  };

  const handleDownload = () => {
    try {
      generateResumePDF(resumeData, selectedTemplate);
      toast.success('Resume downloaded successfully!');
    } catch (error) {
      toast.error('Failed to generate PDF');
      console.error('PDF generation error:', error);
    }
  };

  const getCompletionPercentage = () => {
    let completed = 0;
    let total = 7;

    if (resumeData.personalInfo.name) completed++;
    if (resumeData.personalInfo.email) completed++;
    if (resumeData.personalInfo.summary) completed++;
    if (resumeData.skills.length > 0) completed++;
    if (resumeData.experience.length > 0) completed++;
    if (resumeData.education.length > 0) completed++;
    if ((resumeData.projects || []).length > 0) completed++;

    return Math.round((completed / total) * 100);
  };

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: User, color: 'from-blue-500 to-blue-600' },
    { id: 'experience', label: 'Experience', icon: Briefcase, color: 'from-green-500 to-green-600' },
    { id: 'education', label: 'Education', icon: GraduationCap, color: 'from-purple-500 to-purple-600' },
    { id: 'skills', label: 'Skills', icon: Code, color: 'from-orange-500 to-orange-600' },
    { id: 'projects', label: 'Projects', icon: Award, color: 'from-pink-500 to-pink-600' }
  ];

  return (
    <section id="resume" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 px-4 py-2 rounded-full text-sm font-medium text-blue-800 dark:text-blue-200 border border-blue-200/50 dark:border-blue-700/50 mb-6"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Resume Builder</span>
          </motion.div>
          
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Build Your Perfect
            <span className="gradient-text"> Resume</span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Create ATS-friendly resumes with our intelligent builder. Choose from professional templates 
            and get AI-powered feedback to land your dream job.
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Resume Completion
            </h3>
            <div className="flex items-center space-x-2">
              {isSaving ? (
                <div className="flex items-center space-x-2 text-blue-600">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Saving...</span>
                </div>
              ) : lastSaved ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Saved {lastSaved.toLocaleTimeString()}</span>
                </div>
              ) : null}
            </div>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${getCompletionPercentage()}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {getCompletionPercentage()}% Complete
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowImporter(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all shadow-lg"
          >
            <Upload className="w-5 h-5" />
            <span>Import Resume</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowPreview(true)}
            className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-all shadow-lg"
          >
            <Eye className="w-5 h-5" />
            <span>Preview Resume</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-all shadow-lg"
          >
            <Download className="w-5 h-5" />
            <span>Download PDF</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={saveToLocalStorage}
            className="flex items-center space-x-2 bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-all shadow-lg"
          >
            <Save className="w-5 h-5" />
            <span>Save Progress</span>
          </motion.button>
        </motion.div>

        {/* Template Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <TemplateSelector
            selectedTemplate={selectedTemplate}
            onTemplateSelect={setSelectedTemplate}
          />
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Section Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Resume Sections
              </h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <motion.button
                    key={section.id}
                    onClick={() => setActiveSection(section.id as any)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                      activeSection === section.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activeSection === section.id 
                        ? 'bg-white/20' 
                        : `bg-gradient-to-r ${section.color}`
                    }`}>
                      <section.icon className={`w-4 h-4 ${
                        activeSection === section.id ? 'text-white' : 'text-white'
                      }`} />
                    </div>
                    <span className="font-medium">{section.label}</span>
                  </motion.button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Form Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8">
              <AnimatePresence mode="wait">
                {activeSection === 'personal' && (
                  <motion.div
                    key="personal"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Personal Information
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={resumeData.personalInfo.name}
                          onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
                          className="input-base"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={resumeData.personalInfo.email}
                          onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                          className="input-base"
                          placeholder="your.email@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={resumeData.personalInfo.phone}
                          onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                          className="input-base"
                          placeholder="+91 98765 43210"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          value={resumeData.personalInfo.location}
                          onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                          className="input-base"
                          placeholder="City, State, Country"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          LinkedIn Profile
                        </label>
                        <input
                          type="url"
                          value={resumeData.personalInfo.linkedin}
                          onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)}
                          className="input-base"
                          placeholder="https://linkedin.com/in/yourprofile"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          GitHub Profile
                        </label>
                        <input
                          type="url"
                          value={resumeData.personalInfo.github}
                          onChange={(e) => handlePersonalInfoChange('github', e.target.value)}
                          className="input-base"
                          placeholder="https://github.com/yourusername"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Professional Summary *
                      </label>
                      <textarea
                        value={resumeData.personalInfo.summary}
                        onChange={(e) => handlePersonalInfoChange('summary', e.target.value)}
                        rows={4}
                        className="input-base resize-none"
                        placeholder="Write a compelling summary of your professional background, key skills, and career objectives..."
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {resumeData.personalInfo.summary.length}/500 characters
                      </p>
                    </div>
                  </motion.div>
                )}

                {activeSection === 'experience' && (
                  <motion.div
                    key="experience"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          Work Experience
                        </h3>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={addExperience}
                        className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Experience</span>
                      </motion.button>
                    </div>

                    {resumeData.experience.length === 0 ? (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No work experience added yet.</p>
                        <p className="text-sm">Click "Add Experience" to get started.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {resumeData.experience.map((exp, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Experience #{index + 1}
                              </h4>
                              <button
                                onClick={() => removeExperience(index)}
                                className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Job Title
                                </label>
                                <input
                                  type="text"
                                  value={exp.title}
                                  onChange={(e) => updateExperience(index, 'title', e.target.value)}
                                  className="input-base"
                                  placeholder="Software Engineer"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Company
                                </label>
                                <input
                                  type="text"
                                  value={exp.company}
                                  onChange={(e) => updateExperience(index, 'company', e.target.value)}
                                  className="input-base"
                                  placeholder="Company Name"
                                />
                              </div>

                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Duration
                                </label>
                                <input
                                  type="text"
                                  value={exp.duration}
                                  onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                                  className="input-base"
                                  placeholder="Jan 2020 - Present"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Job Description
                              </label>
                              <textarea
                                value={exp.description}
                                onChange={(e) => updateExperience(index, 'description', e.target.value)}
                                rows={3}
                                className="input-base resize-none"
                                placeholder="Describe your responsibilities, achievements, and impact..."
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeSection === 'education' && (
                  <motion.div
                    key="education"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          Education
                        </h3>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={addEducation}
                        className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Education</span>
                      </motion.button>
                    </div>

                    {resumeData.education.length === 0 ? (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <GraduationCap className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No education added yet.</p>
                        <p className="text-sm">Click "Add Education" to get started.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {resumeData.education.map((edu, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Education #{index + 1}
                              </h4>
                              <button
                                onClick={() => removeEducation(index)}
                                className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Degree
                                </label>
                                <input
                                  type="text"
                                  value={edu.degree}
                                  onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                  className="input-base"
                                  placeholder="Bachelor of Technology"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Institution
                                </label>
                                <input
                                  type="text"
                                  value={edu.institution}
                                  onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                                  className="input-base"
                                  placeholder="University Name"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Year
                                </label>
                                <input
                                  type="text"
                                  value={edu.year}
                                  onChange={(e) => updateEducation(index, 'year', e.target.value)}
                                  className="input-base"
                                  placeholder="2020-2024"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  GPA (Optional)
                                </label>
                                <input
                                  type="text"
                                  value={edu.gpa}
                                  onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                                  className="input-base"
                                  placeholder="8.5/10"
                                />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeSection === 'skills' && (
                  <motion.div
                    key="skills"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                        <Code className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Skills & Technologies
                      </h3>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Add Skill
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Enter a skill (e.g., JavaScript, React, Python)"
                          className="input-base"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addSkill(e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                            addSkill(input.value);
                            input.value = '';
                          }}
                          className="bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 transition-all"
                        >
                          <Plus className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>

                    {resumeData.skills.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Your Skills ({resumeData.skills.length})
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {resumeData.skills.map((skill, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              whileHover={{ scale: 1.05 }}
                              className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-2 rounded-full"
                            >
                              <span className="text-sm font-medium">{skill}</span>
                              <button
                                onClick={() => removeSkill(index)}
                                className="hover:bg-white/20 rounded-full p-1 transition-all"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {resumeData.skills.length === 0 && (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <Code className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No skills added yet.</p>
                        <p className="text-sm">Add your technical and professional skills above.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeSection === 'projects' && (
                  <motion.div
                    key="projects"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
                          <Award className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          Projects & Portfolio
                        </h3>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={addProject}
                        className="flex items-center space-x-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Project</span>
                      </motion.button>
                    </div>

                    {(resumeData.projects || []).length === 0 ? (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <Award className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No projects added yet.</p>
                        <p className="text-sm">Showcase your best work and achievements.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {(resumeData.projects || []).map((project, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Project #{index + 1}
                              </h4>
                              <button
                                onClick={() => removeProject(index)}
                                className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Project Name
                                </label>
                                <input
                                  type="text"
                                  value={project.name}
                                  onChange={(e) => updateProject(index, 'name', e.target.value)}
                                  className="input-base"
                                  placeholder="E-commerce Website"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Technologies Used
                                </label>
                                <input
                                  type="text"
                                  value={project.technologies}
                                  onChange={(e) => updateProject(index, 'technologies', e.target.value)}
                                  className="input-base"
                                  placeholder="React, Node.js, MongoDB"
                                />
                              </div>

                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Project Link (Optional)
                                </label>
                                <input
                                  type="url"
                                  value={project.link}
                                  onChange={(e) => updateProject(index, 'link', e.target.value)}
                                  className="input-base"
                                  placeholder="https://github.com/username/project"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Project Description
                              </label>
                              <textarea
                                value={project.description}
                                onChange={(e) => updateProject(index, 'description', e.target.value)}
                                rows={3}
                                className="input-base resize-none"
                                placeholder="Describe what you built, the problem it solves, and your role..."
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Bottom Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Download Your Resume?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your resume is {getCompletionPercentage()}% complete. 
              {getCompletionPercentage() < 70 && " Add more information to improve your chances!"}
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPreview(true)}
                className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-all shadow-lg"
              >
                <Eye className="w-5 h-5" />
                <span>Preview Resume</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownload}
                disabled={getCompletionPercentage() < 30}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5" />
                <span>Download PDF</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showPreview && (
          <ResumePreview
            isOpen={showPreview}
            onClose={() => setShowPreview(false)}
            resumeData={resumeData}
            templateId={selectedTemplate}
            onDownload={handleDownload}
          />
        )}
        
        {showImporter && (
          <ResumeImporter
            onDataImported={(data) => {
              setResumeData(data);
              setShowImporter(false);
              toast.success('Resume data imported successfully!');
            }}
            onClose={() => setShowImporter(false)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default ResumeBuilder;
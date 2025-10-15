import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { BookOpen, TrendingUp, Video, FileText, Brain, ExternalLink, CheckCircle, XCircle } from 'lucide-react'
import './App.css'

const API_URL = 'https://adaptive-learning-system.onrender.com/api'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [view, setView] = useState('login')
  
  // Login/Register form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [learningStyle, setLearningStyle] = useState('visual')
  
  // Dashboard states
  const [recommendations, setRecommendations] = useState([])
  const [progress, setProgress] = useState([])
  const [courses, setCourses] = useState([])
  
  // Quiz states
  const [showQuiz, setShowQuiz] = useState(false)
  const [currentQuiz, setCurrentQuiz] = useState(null)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizScore, setQuizScore] = useState(0)
  
  // Admin states
  const [newCourseName, setNewCourseName] = useState('')
  const [newCourseDesc, setNewCourseDesc] = useState('')
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [newTopicName, setNewTopicName] = useState('')
  const [newTopicDesc, setNewTopicDesc] = useState('')

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      setIsLoggedIn(true)
      setView('dashboard')
    }
  }, [])

  useEffect(() => {
    if (isLoggedIn && user) {
      fetchDashboardData()
    }
  }, [isLoggedIn, user])

  const fetchDashboardData = async () => {
    try {
      const [recRes, progRes, coursesRes] = await Promise.all([
        fetch(`${API_URL}/recommendations/${user.id.toString()}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/progress/${user.id.toString()}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/courses`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])
      
      const recData = await recRes.json()
      const progData = await progRes.json()
      const coursesData = await coursesRes.json()
      
      setRecommendations(recData)
      setProgress(progData)
      setCourses(coursesData)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (res.ok) {
        setToken(data.token)
        setUser(data.user)
        setIsLoggedIn(true)
        setView('dashboard')
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
      } else {
        alert(data.message)
      }
    } catch (err) {
      alert('Login failed: ' + err.message)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, learning_style: learningStyle })
      })
      const data = await res.json()
      if (res.ok) {
        alert('Registration successful! Please login.')
        setView('login')
      } else {
        alert(data.message)
      }
    } catch (err) {
      alert('Registration failed: ' + err.message)
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setToken(null)
    setUser(null)
    setView('login')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const handleMaterialClick = (material) => {
    if (material.type === 'quiz') {
      setCurrentQuiz(material)
      setShowQuiz(true)
      setQuizAnswers({})
      setQuizSubmitted(false)
      setQuizScore(0)
    } else {
      // Open video or PDF in new tab
      window.open(material.content_url, '_blank')
    }
  }

  const handleQuizAnswer = (questionIndex, answerIndex) => {
    setQuizAnswers({
      ...quizAnswers,
      [questionIndex]: answerIndex
    })
  }

  const handleQuizSubmit = async () => {
    if (!currentQuiz || !currentQuiz.quiz_data) return
    
    let correct = 0
    const questions = currentQuiz.quiz_data.questions
    
    questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct) {
        correct++
      }
    })
    
    const score = Math.round((correct / questions.length) * 100)
    setQuizScore(score)
    setQuizSubmitted(true)
    
    // Update progress on backend
    try {
      await fetch(`${API_URL}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          student_id: user.id.toString(),
          topic_id: currentQuiz.topic_id,
          score: score,
          grade: score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F',
          status: score >= 70 ? 'completed' : 'in_progress'
        })
      })
      
      // Refresh dashboard data
      fetchDashboardData()
    } catch (err) {
      console.error('Error updating progress:', err)
    }
  }

  const handleAddCourse = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_URL}/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: newCourseName, description: newCourseDesc })
      })
      if (res.ok) {
        alert('Course added successfully!')
        setNewCourseName('')
        setNewCourseDesc('')
        fetchDashboardData()
      }
    } catch (err) {
      alert('Failed to add course')
    }
  }

  const handleAddTopic = async (e) => {
    e.preventDefault()
    if (!selectedCourse) {
      alert('Please select a course')
      return
    }
    try {
      const res = await fetch(`${API_URL}/topics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          course_id: selectedCourse,
          name: newTopicName,
          description: newTopicDesc
        })
      })
      if (res.ok) {
        alert('Topic added successfully!')
        setNewTopicName('')
        setNewTopicDesc('')
      }
    } catch (err) {
      alert('Failed to add topic')
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Brain className="w-12 h-12 text-indigo-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">Adaptive Learning</CardTitle>
            <CardDescription>Personalized education for every student</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={view} onValueChange={setView}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="student@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">Login</Button>
                </form>
              </TabsContent>
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="student@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="learning-style">Learning Style</Label>
                    <Select value={learningStyle} onValueChange={setLearningStyle}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visual">Visual</SelectItem>
                        <SelectItem value="auditory">Auditory</SelectItem>
                        <SelectItem value="kinesthetic">Kinesthetic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">Register</Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Brain className="w-8 h-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">Adaptive Learning</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
              <Button variant="outline" size="sm" onClick={() => setView('dashboard')}>
                Dashboard
              </Button>
              <Button variant="outline" size="sm" onClick={() => setView('admin')}>
                Admin
              </Button>
              <Button variant="destructive" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Dashboard</h2>
              <p className="text-gray-600">Learning Style: <span className="font-semibold capitalize">{user?.learning_style}</span></p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Recommended Study Materials
                  </CardTitle>
                  <CardDescription>Based on your performance and learning style</CardDescription>
                </CardHeader>
                <CardContent>
                  {recommendations.length === 0 ? (
                    <p className="text-gray-500 text-sm">No recommendations yet. Start learning!</p>
                  ) : (
                    <div className="space-y-4">
                      {recommendations.map((rec, idx) => (
                        <div key={idx} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-3">
                            {rec.material?.type === 'video' && <Video className="w-5 h-5 text-blue-600 mt-1" />}
                            {rec.material?.type === 'pdf' && <FileText className="w-5 h-5 text-red-600 mt-1" />}
                            {rec.material?.type === 'quiz' && <BookOpen className="w-5 h-5 text-purple-600 mt-1" />}
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{rec.topic}</h4>
                              <p className="text-sm text-gray-600 mt-1">{rec.reason}</p>
                              {rec.material && (
                                <Button
                                  variant="link"
                                  className="text-indigo-600 p-0 h-auto mt-2"
                                  onClick={() => handleMaterialClick(rec.material)}
                                >
                                  <ExternalLink className="w-4 h-4 mr-1" />
                                  {rec.material.title} ({rec.material.type})
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="w-5 h-5 text-indigo-600" />
                    Progress Overview
                  </CardTitle>
                  <CardDescription>Your performance across topics</CardDescription>
                </CardHeader>
                <CardContent>
                  {progress.length === 0 ? (
                    <p className="text-gray-500 text-sm">No progress data yet.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={progress.slice(0, 5)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="topic_name" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="score" fill="#6366f1" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Progress</CardTitle>
              </CardHeader>
              <CardContent>
                {progress.length === 0 ? (
                  <p className="text-gray-500 text-sm">No progress data available.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4">Course</th>
                          <th className="text-left py-2 px-4">Topic</th>
                          <th className="text-left py-2 px-4">Score</th>
                          <th className="text-left py-2 px-4">Grade</th>
                          <th className="text-left py-2 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {progress.map((p, idx) => (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-4">{p.course_name}</td>
                            <td className="py-2 px-4">{p.topic_name}</td>
                            <td className="py-2 px-4">{p.score}</td>
                            <td className="py-2 px-4">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                p.grade === 'A' || p.grade === 'B+' ? 'bg-green-100 text-green-800' :
                                p.grade === 'B' || p.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {p.grade}
                              </span>
                            </td>
                            <td className="py-2 px-4">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                p.status === 'completed' ? 'bg-green-100 text-green-800' :
                                p.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {view === 'admin' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Panel</h2>
              <p className="text-gray-600">Manage courses, topics, and study materials</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Course</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddCourse} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="course-name">Course Name</Label>
                      <Input
                        id="course-name"
                        placeholder="e.g., Mathematics"
                        value={newCourseName}
                        onChange={(e) => setNewCourseName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="course-desc">Description</Label>
                      <Input
                        id="course-desc"
                        placeholder="Course description"
                        value={newCourseDesc}
                        onChange={(e) => setNewCourseDesc(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">Add Course</Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Add New Topic</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddTopic} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="select-course">Select Course</Label>
                      <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((course) => (
                            <SelectItem key={course._id} value={course._id}>
                              {course.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="topic-name">Topic Name</Label>
                      <Input
                        id="topic-name"
                        placeholder="e.g., Algebra Basics"
                        value={newTopicName}
                        onChange={(e) => setNewTopicName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="topic-desc">Description</Label>
                      <Input
                        id="topic-desc"
                        placeholder="Topic description"
                        value={newTopicDesc}
                        onChange={(e) => setNewTopicDesc(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">Add Topic</Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Existing Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courses.map((course) => (
                    <div key={course._id} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-lg">{course.name}</h3>
                      <p className="text-sm text-gray-600">{course.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Quiz Dialog */}
      <Dialog open={showQuiz} onOpenChange={setShowQuiz}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentQuiz?.title}</DialogTitle>
            <DialogDescription>
              Answer all questions and submit to see your score
            </DialogDescription>
          </DialogHeader>
          {currentQuiz && currentQuiz.quiz_data && (
            <div className="space-y-6">
              {currentQuiz.quiz_data.questions.map((q, qIdx) => (
                <div key={qIdx} className="space-y-3">
                  <p className="font-semibold">{qIdx + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((option, oIdx) => (
                      <div
                        key={oIdx}
                        className={`p-3 border rounded cursor-pointer transition-colors ${
                          quizSubmitted
                            ? oIdx === q.correct
                              ? 'bg-green-100 border-green-500'
                              : quizAnswers[qIdx] === oIdx
                              ? 'bg-red-100 border-red-500'
                              : 'bg-gray-50'
                            : quizAnswers[qIdx] === oIdx
                            ? 'bg-indigo-100 border-indigo-500'
                            : 'hover:bg-gray-100'
                        }`}
                        onClick={() => !quizSubmitted && handleQuizAnswer(qIdx, oIdx)}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option}</span>
                          {quizSubmitted && oIdx === q.correct && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                          {quizSubmitted && quizAnswers[qIdx] === oIdx && oIdx !== q.correct && (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {!quizSubmitted ? (
                <Button onClick={handleQuizSubmit} className="w-full">
                  Submit Quiz
                </Button>
              ) : (
                <div className="text-center space-y-4">
                  <div className="text-3xl font-bold text-indigo-600">{quizScore}%</div>
                  <p className="text-gray-600">
                    {quizScore >= 90 ? 'Excellent work!' :
                     quizScore >= 70 ? 'Good job!' :
                     quizScore >= 50 ? 'Keep practicing!' :
                     'Review the material and try again!'}
                  </p>
                  <Button onClick={() => setShowQuiz(false)} className="w-full">
                    Close
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default App


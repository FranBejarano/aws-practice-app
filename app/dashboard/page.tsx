import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Target, Trophy, Clock, TrendingUp, Play, CheckCircle, XCircle, Activity } from "lucide-react"
import Link from "next/link"
import {
  getUserStats,
  getTopics,
  getTestHistory,
  getStudySessionHistory,
  getPerformanceByTopic,
  getProgressOverTime,
  getRecentActivity,
} from "@/lib/database"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function DashboardPage() {
  // Check Supabase configuration
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Connect Supabase to get started</h1>
      </div>
    )
  }

  // Check authentication
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const [userStats, topics, testHistory, studyHistory, topicPerformance, progressData, recentActivity] =
    await Promise.all([
      getUserStats(),
      getTopics(),
      getTestHistory(5),
      getStudySessionHistory(5),
      getPerformanceByTopic(),
      getProgressOverTime(),
      getRecentActivity(10),
    ])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AWS Cloud Practitioner Practice</h1>
                <p className="text-gray-600">Welcome back, {user.email}</p>
              </div>
            </div>
            <form action="/api/auth/signout" method="post">
              <Button variant="outline">Sign Out</Button>
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Questions Answered</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.totalQuestions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.accuracy.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">{userStats.correctAnswers} correct answers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Study Sessions</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.studySessions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.totalQuestions > 0 ? "Active" : "Getting Started"}</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Main Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Study Mode */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Study Mode
                  </CardTitle>
                  <CardDescription>
                    Practice questions at your own pace with instant feedback and explanations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                    <Link href="/study">
                      <Play className="h-4 w-4 mr-2" />
                      Start Studying
                    </Link>
                  </Button>
                  <div className="text-sm text-gray-600">
                    • Immediate feedback on answers • Detailed explanations for each question • Progress tracking and
                    statistics
                  </div>
                </CardContent>
              </Card>

              {/* Test Mode */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    Practice Test
                  </CardTitle>
                  <CardDescription>
                    Take timed practice tests that simulate the real AWS exam experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href="/test">
                      <Clock className="h-4 w-4 mr-2" />
                      Take Practice Test
                    </Link>
                  </Button>
                  <div className="text-sm text-gray-600">
                    • Timed exam simulation • 65 questions in 90 minutes • Detailed score report
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            {recentActivity.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {activity.type === "test" ? (
                            <Target className="h-4 w-4 text-green-600" />
                          ) : (
                            <BookOpen className="h-4 w-4 text-blue-600" />
                          )}
                          <div>
                            <p className="font-medium">
                              {activity.type === "test"
                                ? `Practice Test - ${activity.data.score}%`
                                : `Study Session - ${activity.data.questions_studied} questions`}
                            </p>
                            <p className="text-sm text-gray-600">{new Date(activity.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {activity.type === "test" && (
                          <Badge variant={activity.data.score >= 70 ? "default" : "secondary"}>
                            {activity.data.score >= 70 ? "Pass" : "Review"}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Topics Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Available Topics</CardTitle>
                <CardDescription>Choose a specific topic to focus your study session</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {topics.map((topic) => (
                    <Button key={topic} asChild variant="outline" className="h-auto p-4 justify-start bg-transparent">
                      <Link href={`/study?topic=${encodeURIComponent(topic)}`}>
                        <div className="text-left">
                          <div className="font-medium">{topic}</div>
                        </div>
                      </Link>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Favorite Topics */}
            {userStats?.favoriteTopics && userStats.favoriteTopics.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Your Favorite Topics</CardTitle>
                  <CardDescription>Topics you've studied the most</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {userStats.favoriteTopics.map((topic) => (
                      <Badge key={topic} variant="secondary" className="text-sm">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {/* Performance by Topic */}
            {topicPerformance.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Performance by Topic</CardTitle>
                  <CardDescription>Your accuracy across different AWS topics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topicPerformance.map((topic) => (
                      <div key={topic.topic} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{topic.topic}</span>
                          <span className="text-sm text-gray-600">
                            {topic.correctAnswers}/{topic.totalQuestions} ({topic.accuracy.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={topic.accuracy} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Strengths and Weaknesses */}
            {topicPerformance.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {topicPerformance
                        .filter((topic) => topic.accuracy >= 70)
                        .slice(0, 5)
                        .map((topic) => (
                          <div key={topic.topic} className="flex items-center justify-between">
                            <span className="text-sm">{topic.topic}</span>
                            <Badge variant="default">{topic.accuracy.toFixed(1)}%</Badge>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <XCircle className="h-5 w-5" />
                      Areas to Improve
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {topicPerformance
                        .filter((topic) => topic.accuracy < 70)
                        .slice(0, 5)
                        .map((topic) => (
                          <div key={topic.topic} className="flex items-center justify-between">
                            <span className="text-sm">{topic.topic}</span>
                            <Badge variant="secondary">{topic.accuracy.toFixed(1)}%</Badge>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Test History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Recent Tests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {testHistory.length > 0 ? (
                    <div className="space-y-3">
                      {testHistory.map((test) => (
                        <div key={test.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">Practice Test</p>
                            <p className="text-sm text-gray-600">
                              {new Date(test.test_date).toLocaleDateString()} • {test.time_taken} minutes
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant={test.score >= 70 ? "default" : "secondary"}>{test.score}%</Badge>
                            <p className="text-sm text-gray-600 mt-1">
                              {test.correct_answers}/{test.total_questions}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-4">No tests taken yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Study History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Recent Study Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {studyHistory.length > 0 ? (
                    <div className="space-y-3">
                      {studyHistory.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">Study Session</p>
                            <p className="text-sm text-gray-600">
                              {new Date(session.created_at).toLocaleDateString()} • {session.time_spent} minutes
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{session.questions_studied}</p>
                            <p className="text-sm text-gray-600">questions</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-4">No study sessions yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Progress Over Time */}
            {progressData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Progress Over Time
                  </CardTitle>
                  <CardDescription>Your accuracy trend over the past weeks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {progressData.slice(-8).map((week) => (
                      <div key={week.week} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Week of {new Date(week.week).toLocaleDateString()}
                          </span>
                          <span className="text-sm text-gray-600">
                            {week.accuracy.toFixed(1)}% ({week.totalQuestions} questions)
                          </span>
                        </div>
                        <Progress value={week.accuracy} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Study Recommendations */}
            {topicPerformance.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Study Recommendations</CardTitle>
                  <CardDescription>Based on your performance data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topicPerformance
                      .filter((topic) => topic.accuracy < 70)
                      .slice(0, 3)
                      .map((topic) => (
                        <div key={topic.topic} className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-900">{topic.topic}</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Current accuracy: {topic.accuracy.toFixed(1)}% • Focus on this topic to improve your overall
                            score
                          </p>
                          <Button asChild size="sm" className="mt-2">
                            <Link href={`/study?topic=${encodeURIComponent(topic.topic)}`}>Study {topic.topic}</Link>
                          </Button>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

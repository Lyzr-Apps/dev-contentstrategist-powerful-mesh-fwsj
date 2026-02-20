'use client'

import React, { useState, useEffect } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { VscGitCommit, VscGitPullRequest, VscTag, VscGithub } from 'react-icons/vsc'
import { HiOutlineMail, HiOutlineCalendar, HiOutlineChartBar, HiOutlineDocumentText, HiOutlineLightBulb, HiOutlineBeaker } from 'react-icons/hi'
import { FiSend, FiEdit3, FiTrendingUp, FiTarget, FiLayers, FiActivity, FiCheckCircle, FiAlertCircle, FiLoader, FiChevronRight, FiStar, FiExternalLink } from 'react-icons/fi'
import { BiAnalyse } from 'react-icons/bi'

// Agent IDs
const CONTENT_STRATEGY_COORDINATOR_ID = '6997cb3dd5fa166f311285e2'
const CONTENT_DELIVERY_AGENT_ID = '6997cb3ed223b2279bfea07a'
const ENGAGEMENT_OPTIMIZER_AGENT_ID = '6997cb3eec13e822226888ea'
const TREND_SCOUT_AGENT_ID = '6997cea0ea437a36da816328'

// TypeScript interfaces
interface EmailContent {
  subject_line: string
  preview_text: string
  body: string
  cta: string
}

interface SocialContent {
  twitter: string
  linkedin: string
  devto_title: string
  devto_body: string
}

interface BlogContent {
  title: string
  meta_description: string
  body: string
  tags: string[]
}

interface ContentStrategyResponse {
  executive_summary: string
  key_themes: string[]
  email_content: EmailContent
  social_content: SocialContent
  blog_content: BlogContent
  github_context_summary: string
}

interface EmailDelivery {
  status: string
  recipients_count: string
  subject: string
  sent_at: string
}

interface CalendarEvent {
  event_title: string
  date_time: string
  calendar: string
  status: string
}

interface ContentDeliveryResponse {
  email_delivery: EmailDelivery
  calendar_events: CalendarEvent[]
  delivery_summary: string
}

interface PerformanceAnalysis {
  overall_score: string
  summary: string
  top_performers: string[]
  areas_for_improvement: string[]
}

interface ABTestSuggestion {
  test_name: string
  hypothesis: string
  variant_a: string
  variant_b: string
  expected_impact: string
  metric_to_track: string
}

interface EngagementPrediction {
  topic: string
  predicted_open_rate: string
  predicted_click_rate: string
  confidence: string
  reasoning: string
}

interface OptimizationStrategy {
  strategy: string
  description: string
  expected_impact: string
  implementation_effort: string
  priority: string
}

interface EngagementOptimizerResponse {
  performance_analysis: PerformanceAnalysis
  ab_testing_suggestions: ABTestSuggestion[]
  engagement_predictions: EngagementPrediction[]
  optimization_strategies: OptimizationStrategy[]
}

interface Campaign {
  id: string
  title: string
  date: string
  status: 'Draft' | 'Sent' | 'Scheduled'
  repo: string
  formats: string[]
}

interface StatusMessage {
  type: 'loading' | 'success' | 'error'
  text: string
}

interface ActivityItem {
  type: 'commit' | 'pr' | 'release'
  message: string
  time: string
  author: string
}

interface TrendingTopic {
  trend_name: string
  category: string
  description: string
  why_it_matters: string
  momentum: string
  content_angle: string
  source: string
}

interface TrendingRepo {
  repo_name: string
  description: string
  stars: string
  language: string
  why_trending: string
}

interface ContentRecommendation {
  topic: string
  format: string
  target_audience: string
  urgency: string
  estimated_engagement: string
}

interface TrendScoutResponse {
  trends_summary: string
  trending_topics: TrendingTopic[]
  trending_repos: TrendingRepo[]
  content_recommendations: ContentRecommendation[]
  scan_timestamp: string
}

// Sample data
const SAMPLE_ACTIVITY: ActivityItem[] = [
  { type: 'release', message: 'v4.2.0 - Performance improvements and new hooks API', time: '2h ago', author: 'core-team' },
  { type: 'commit', message: 'fix: resolve hydration mismatch in SSR components', time: '4h ago', author: 'devcontrib' },
  { type: 'pr', message: 'feat: add useOptimistic hook for concurrent mode', time: '6h ago', author: 'contributor42' },
  { type: 'commit', message: 'refactor: migrate internal state to signals pattern', time: '8h ago', author: 'core-team' },
  { type: 'pr', message: 'docs: update migration guide for v4.x breaking changes', time: '12h ago', author: 'docs-team' },
  { type: 'release', message: 'v4.1.3 - Security patch for XSS vulnerability', time: '1d ago', author: 'security-team' },
]

const SAMPLE_CAMPAIGNS: Campaign[] = [
  { id: '1', title: 'React v4.2.0 Launch Campaign', date: '2024-01-15', status: 'Sent', repo: 'facebook/react', formats: ['Email', 'Social', 'Blog'] },
  { id: '2', title: 'Signals API Deep Dive', date: '2024-01-12', status: 'Scheduled', repo: 'facebook/react', formats: ['Email', 'Blog'] },
  { id: '3', title: 'Security Patch Announcement', date: '2024-01-10', status: 'Draft', repo: 'facebook/react', formats: ['Email', 'Social'] },
]

const SAMPLE_CONTENT: ContentStrategyResponse = {
  executive_summary: 'This campaign highlights the release of React v4.2.0, featuring significant performance improvements and a new hooks API. The update addresses key developer pain points around hydration in SSR and introduces concurrent mode optimizations.',
  key_themes: ['Performance Optimization', 'New Hooks API', 'SSR Improvements', 'Developer Experience', 'Concurrent Mode'],
  email_content: {
    subject_line: 'React v4.2.0 is here: Faster, smarter, and more concurrent than ever',
    preview_text: 'Discover the new hooks API and 40% faster hydration in the latest React release.',
    body: '# React v4.2.0 Release Highlights\n\nWe are excited to announce React v4.2.0, a major release packed with performance improvements and developer experience enhancements.\n\n## Key Features\n\n- **New useOptimistic hook** for seamless concurrent UI updates\n- **40% faster SSR hydration** through intelligent partial hydration\n- **Signals-inspired state management** built into the core\n\n## Getting Started\n\nUpgrade your project today:\n```bash\nnpm install react@4.2.0 react-dom@4.2.0\n```\n\nCheck our migration guide for breaking changes and upgrade paths.',
    cta: 'Read the full changelog and migration guide'
  },
  social_content: {
    twitter: 'React v4.2.0 just dropped! New useOptimistic hook, 40% faster SSR hydration, and signals-inspired state management. The future of UI development is here. Upgrade now and see the difference. #ReactJS #WebDev #JavaScript',
    linkedin: 'Excited to share that React v4.2.0 is now available! This release represents months of work focused on performance and developer experience.\n\nKey highlights:\n- New useOptimistic hook for concurrent UI patterns\n- 40% improvement in SSR hydration performance\n- Signals-inspired reactive state management\n\nOur team has been working closely with the community to address the most requested features. The new hooks API simplifies complex state management patterns that previously required external libraries.\n\nWhat feature are you most excited about? Share your thoughts below!',
    devto_title: 'React v4.2.0: A Deep Dive into the New Hooks API and Performance Gains',
    devto_body: '# React v4.2.0: A Deep Dive\n\n## Introduction\n\nThe React team has just released v4.2.0, and it is a game-changer. This release brings the most significant performance improvements we have seen since the introduction of concurrent mode.\n\n## The New useOptimistic Hook\n\nThe `useOptimistic` hook allows developers to optimistically update UI state before server confirmation...\n\n## SSR Hydration Improvements\n\nServer-side rendering just got 40% faster with intelligent partial hydration...\n\n## Migration Guide\n\nUpgrading from v4.1.x is straightforward with minimal breaking changes...'
  },
  blog_content: {
    title: 'React v4.2.0: Performance, Hooks, and the Future of UI Development',
    meta_description: 'Explore the new features in React v4.2.0 including the useOptimistic hook, 40% faster SSR hydration, and signals-inspired state management.',
    body: '# React v4.2.0: Performance, Hooks, and the Future\n\n## Executive Summary\n\nReact v4.2.0 represents a significant milestone in the evolution of the framework. With a focus on performance, developer experience, and modern patterns, this release addresses the most common pain points reported by the community.\n\n## What is New\n\n### useOptimistic Hook\nThe new `useOptimistic` hook provides a first-class API for implementing optimistic UI patterns...\n\n### SSR Hydration\nPartial hydration now selectively hydrates only the interactive portions of the page...\n\n### Signals Integration\nInspired by the signals pattern, React now offers fine-grained reactivity...',
    tags: ['react', 'javascript', 'web-development', 'frontend', 'performance']
  },
  github_context_summary: 'Repository facebook/react has seen 47 commits, 12 merged PRs, and 2 releases in the past week. Major contributors include core-team, devcontrib, and contributor42. The v4.2.0 release closed 23 issues and introduced 5 new features.'
}

const SAMPLE_DELIVERY: ContentDeliveryResponse = {
  email_delivery: {
    status: 'Sent',
    recipients_count: '1',
    subject: 'React v4.2.0 is here: Faster, smarter, and more concurrent',
    sent_at: '2024-01-15T10:30:00Z'
  },
  calendar_events: [
    { event_title: 'React v4.2.0 Social Media Push', date_time: '2024-01-16T09:00:00Z', calendar: 'primary', status: 'Created' },
    { event_title: 'Blog Post Publication', date_time: '2024-01-17T14:00:00Z', calendar: 'primary', status: 'Created' }
  ],
  delivery_summary: 'Email campaign sent successfully to 1 recipient. 2 calendar events created for content distribution scheduling.'
}

const SAMPLE_OPTIMIZATION: EngagementOptimizerResponse = {
  performance_analysis: {
    overall_score: '78/100',
    summary: 'The campaign shows strong open rates and moderate click-through engagement. Technical content resonates well with the developer audience, but CTAs could be more compelling. Social media performance is above industry average for developer-focused content.',
    top_performers: ['Email open rate at 42% (industry avg: 28%)', 'LinkedIn engagement 3x above baseline', 'Blog post shared 150+ times in first 24h'],
    areas_for_improvement: ['Twitter click-through rate below target (2.1% vs 3.5% goal)', 'Email CTA conversion needs optimization', 'Dev.to article engagement declining after day 2']
  },
  ab_testing_suggestions: [
    { test_name: 'Email Subject Line Test', hypothesis: 'Technical specificity in subject lines increases open rates for developer audiences', variant_a: 'React v4.2.0 is here: New hooks and performance gains', variant_b: 'useOptimistic + 40% faster hydration: React v4.2.0 changelog', expected_impact: '+5-8% open rate', metric_to_track: 'Email open rate' },
    { test_name: 'CTA Button Copy Test', hypothesis: 'Action-oriented CTAs outperform descriptive ones', variant_a: 'Read the changelog', variant_b: 'Upgrade your project now', expected_impact: '+3-5% click rate', metric_to_track: 'CTA click-through rate' },
    { test_name: 'Social Post Timing', hypothesis: 'Developer engagement peaks during morning commute hours', variant_a: 'Post at 9:00 AM EST', variant_b: 'Post at 11:00 AM EST', expected_impact: '+10-15% engagement', metric_to_track: 'Social media impressions and clicks' }
  ],
  engagement_predictions: [
    { topic: 'Performance benchmarks with code examples', predicted_open_rate: '45%', predicted_click_rate: '8.2%', confidence: 'High', reasoning: 'Developer audiences consistently engage more with benchmark data and reproducible examples' },
    { topic: 'Migration guide with breaking changes', predicted_open_rate: '52%', predicted_click_rate: '12.5%', confidence: 'Very High', reasoning: 'Upgrade content has the highest urgency factor driving both opens and clicks' },
    { topic: 'Community spotlight and contributor stories', predicted_open_rate: '35%', predicted_click_rate: '5.1%', confidence: 'Medium', reasoning: 'Human interest content has moderate but consistent engagement in technical communities' }
  ],
  optimization_strategies: [
    { strategy: 'Segmented Email Sends', description: 'Split audience by engagement level and send tailored content to each segment. High-engagement users get deep technical content, casual readers get highlights.', expected_impact: 'High', implementation_effort: 'Medium', priority: 'P1' },
    { strategy: 'Interactive Code Snippets', description: 'Embed runnable code examples in email and blog content using CodeSandbox or StackBlitz integrations.', expected_impact: 'High', implementation_effort: 'High', priority: 'P2' },
    { strategy: 'Thread-Based Social Strategy', description: 'Convert long-form content into Twitter/X threads with each key feature as a separate tweet for better algorithmic distribution.', expected_impact: 'Medium', implementation_effort: 'Low', priority: 'P1' },
    { strategy: 'Follow-Up Drip Campaign', description: 'Create a 3-email drip sequence: announcement, deep dive, and migration guide sent over 5 days.', expected_impact: 'High', implementation_effort: 'Medium', priority: 'P2' }
  ]
}

// Markdown renderer
function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-2">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-sm mt-3 mb-1">{line.slice(4)}</h4>
        if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-base mt-3 mb-1">{line.slice(3)}</h3>
        if (line.startsWith('# ')) return <h2 key={i} className="font-bold text-lg mt-4 mb-2">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 list-disc text-sm">{formatInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 list-decimal text-sm">{formatInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (line.startsWith('```')) return <div key={i} className="font-mono text-xs bg-muted px-2 py-1 border border-border">{line.replace(/```\w*/, '')}</div>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm">{formatInline(line)}</p>
      })}
    </div>
  )
}

function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) {
    const codeParts = text.split(/`(.*?)`/g)
    if (codeParts.length === 1) return text
    return codeParts.map((part, i) =>
      i % 2 === 1 ? <code key={i} className="font-mono text-xs bg-muted px-1 py-0.5 border border-border">{part}</code> : part
    )
  }
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part
  )
}

// Status message component
function StatusBar({ status }: { status: StatusMessage | null }) {
  if (!status) return null
  return (
    <div className={`flex items-center gap-2 px-3 py-2 text-sm border ${status.type === 'loading' ? 'border-primary/30 bg-primary/5 text-primary' : status.type === 'success' ? 'border-accent/30 bg-accent/5 text-accent' : 'border-destructive/30 bg-destructive/5 text-destructive'}`}>
      {status.type === 'loading' && <FiLoader className="h-4 w-4 animate-spin" />}
      {status.type === 'success' && <FiCheckCircle className="h-4 w-4" />}
      {status.type === 'error' && <FiAlertCircle className="h-4 w-4" />}
      <span>{status.text}</span>
    </div>
  )
}

// Activity item component
function ActivityItemRow({ item }: { item: ActivityItem }) {
  const iconMap = {
    commit: <VscGitCommit className="h-4 w-4 text-accent" />,
    pr: <VscGitPullRequest className="h-4 w-4 text-destructive" />,
    release: <VscTag className="h-4 w-4 text-primary" />
  }
  return (
    <div className="flex items-start gap-3 py-2 px-2 border-b border-border last:border-0">
      <div className="mt-0.5">{iconMap[item.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{item.message}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">{item.author}</span>
          <span className="text-xs text-muted-foreground">{item.time}</span>
        </div>
      </div>
    </div>
  )
}

// Campaign card component
function CampaignCard({ campaign }: { campaign: Campaign }) {
  const statusColors: Record<string, string> = {
    Draft: 'bg-muted text-muted-foreground',
    Sent: 'bg-accent/20 text-accent',
    Scheduled: 'bg-primary/20 text-primary'
  }
  return (
    <Card className="mb-2">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{campaign.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground font-mono">{campaign.repo}</span>
              <span className="text-xs text-muted-foreground">{campaign.date}</span>
            </div>
            <div className="flex items-center gap-1 mt-2">
              {Array.isArray(campaign.formats) && campaign.formats.map((f) => (
                <Badge key={f} variant="outline" className="text-xs py-0 px-1.5">{f}</Badge>
              ))}
            </div>
          </div>
          <Badge className={`text-xs shrink-0 ${statusColors[campaign.status] || ''}`}>{campaign.status}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}

// Priority badge component
function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    P1: 'bg-destructive/20 text-destructive border-destructive/30',
    P2: 'bg-primary/20 text-primary border-primary/30',
    P3: 'bg-muted text-muted-foreground border-border'
  }
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 text-xs font-mono border ${colors[priority] || colors.P3}`}>{priority}</span>
  )
}

// ErrorBoundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm">{this.state.error}</p>
            <button onClick={() => this.setState({ hasError: false, error: '' })} className="px-4 py-2 bg-primary text-primary-foreground text-sm">Try again</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// Agent info
const AGENTS = [
  { id: CONTENT_STRATEGY_COORDINATOR_ID, name: 'Content Strategy Coordinator', purpose: 'Generates multi-format developer content from GitHub activity' },
  { id: CONTENT_DELIVERY_AGENT_ID, name: 'Content Delivery Agent', purpose: 'Sends emails via Gmail and creates Google Calendar events' },
  { id: ENGAGEMENT_OPTIMIZER_AGENT_ID, name: 'Engagement Optimizer', purpose: 'Analyzes engagement metrics and suggests optimizations' },
  { id: TREND_SCOUT_AGENT_ID, name: 'Trend Scout', purpose: 'Scans real-time developer trends via Perplexity' },
]

export default function Page() {
  // Navigation
  const [activeScreen, setActiveScreen] = useState<'dashboard' | 'review' | 'analytics' | 'trends'>('dashboard')

  // Sample data toggle
  const [showSampleData, setShowSampleData] = useState(false)

  // Active agent tracking
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)

  // Status
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)

  // Dashboard state
  const [repoName, setRepoName] = useState('')
  const [contentFocus, setContentFocus] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<ContentStrategyResponse | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  // Review & Deliver state
  const [editedEmail, setEditedEmail] = useState({ subject_line: '', preview_text: '', body: '', cta: '' })
  const [editedSocial, setEditedSocial] = useState({ twitter: '', linkedin: '', devto_title: '', devto_body: '' })
  const [editedBlog, setEditedBlog] = useState({ title: '', meta_description: '', body: '', tags: '' })
  const [recipientEmail, setRecipientEmail] = useState('')
  const [eventTitle, setEventTitle] = useState('')
  const [eventDateTime, setEventDateTime] = useState('')
  const [calendarName, setCalendarName] = useState('primary')
  const [delivering, setDelivering] = useState(false)
  const [deliveryResult, setDeliveryResult] = useState<ContentDeliveryResponse | null>(null)

  // Analytics state
  const [metricsForm, setMetricsForm] = useState({ campaign_name: '', open_rate: '', click_rate: '', shares: '', conversions: '' })
  const [analyzing, setAnalyzing] = useState(false)
  const [optimizationResult, setOptimizationResult] = useState<EngagementOptimizerResponse | null>(null)

  // Trends state
  const [trendsDomain, setTrendsDomain] = useState('')
  const [scanningTrends, setScanningTrends] = useState(false)
  const [trendsResult, setTrendsResult] = useState<TrendScoutResponse | null>(null)

  // Sync editable content when generatedContent changes
  useEffect(() => {
    if (generatedContent) {
      setEditedEmail({
        subject_line: generatedContent.email_content?.subject_line ?? '',
        preview_text: generatedContent.email_content?.preview_text ?? '',
        body: generatedContent.email_content?.body ?? '',
        cta: generatedContent.email_content?.cta ?? ''
      })
      setEditedSocial({
        twitter: generatedContent.social_content?.twitter ?? '',
        linkedin: generatedContent.social_content?.linkedin ?? '',
        devto_title: generatedContent.social_content?.devto_title ?? '',
        devto_body: generatedContent.social_content?.devto_body ?? ''
      })
      const tags = Array.isArray(generatedContent.blog_content?.tags) ? generatedContent.blog_content.tags.join(', ') : ''
      setEditedBlog({
        title: generatedContent.blog_content?.title ?? '',
        meta_description: generatedContent.blog_content?.meta_description ?? '',
        body: generatedContent.blog_content?.body ?? '',
        tags
      })
    }
  }, [generatedContent])

  // Populate sample data
  useEffect(() => {
    if (showSampleData) {
      setRepoName('facebook/react')
      setContentFocus('latest release')
      setCampaigns(SAMPLE_CAMPAIGNS)
      setGeneratedContent(SAMPLE_CONTENT)
      setDeliveryResult(SAMPLE_DELIVERY)
      setOptimizationResult(SAMPLE_OPTIMIZATION)
      setMetricsForm({ campaign_name: 'React v4.2.0 Launch', open_rate: '42', click_rate: '6.8', shares: '150', conversions: '28' })
      setTrendsResult({
        trends_summary: 'The developer ecosystem in February 2026 is dominated by AI-native development tools, WebAssembly adoption for edge computing, and the rise of type-safe full-stack frameworks. Rust continues its growth in systems programming while TypeScript solidifies its position as the default for web development.',
        trending_topics: [
          { trend_name: 'AI Code Agents', category: 'AI & ML', description: 'Autonomous coding agents that can plan, write, test, and deploy code with minimal human intervention are seeing explosive adoption.', why_it_matters: 'Fundamentally changes the developer workflow and productivity metrics.', momentum: 'Rising', content_angle: 'Compare top AI code agents, benchmark their accuracy on real codebases, and share practical integration tips.', source: 'Hacker News, GitHub Trending, Twitter/X' },
          { trend_name: 'WebAssembly Edge Runtime', category: 'Web Development', description: 'WASM-based edge runtimes are replacing traditional serverless for latency-critical applications.', why_it_matters: 'Enables near-native performance at the edge with any language.', momentum: 'Rising', content_angle: 'Tutorial on deploying a WASM service worker with performance benchmarks vs traditional serverless.', source: 'Reddit r/webdev, Conference talks' },
          { trend_name: 'React Server Components 2.0', category: 'Frameworks & Libraries', description: 'The next evolution of RSC brings streaming SSR improvements and a simplified mental model.', why_it_matters: 'Reduces client bundle sizes and improves Core Web Vitals.', momentum: 'Peaking', content_angle: 'Migration guide from traditional React to RSC 2.0 with real-world performance comparisons.', source: 'React blog, Twitter/X' },
          { trend_name: 'Bun 2.0 Release', category: 'Developer Tools', description: 'Bun 2.0 ships with native TypeScript execution, improved Node.js compatibility, and a built-in test runner.', why_it_matters: 'Challenges Node.js dominance with significantly faster execution and DX.', momentum: 'Rising', content_angle: 'Benchmark Bun 2.0 vs Node.js 22 vs Deno 2 for common developer workflows.', source: 'GitHub, Hacker News' },
          { trend_name: 'Rust for Backend APIs', category: 'Programming Languages', description: 'Rust frameworks like Axum and Actix are seeing adoption for production API servers.', why_it_matters: 'Offers memory safety without GC pause, appealing for high-throughput services.', momentum: 'Rising', content_angle: 'Build a REST API in Rust vs Go vs TypeScript -- developer experience and performance comparison.', source: 'Reddit r/rust, Dev.to' },
          { trend_name: 'Cursor + Claude Workflows', category: 'AI & ML', description: 'Developers are building complex automation workflows combining Cursor IDE with Claude for end-to-end development.', why_it_matters: 'Represents a paradigm shift in how developers interact with their IDE.', momentum: 'Peaking', content_angle: 'Showcase a real project built entirely with AI-assisted workflows, documenting the process and outcomes.', source: 'Twitter/X, YouTube' }
        ],
        trending_repos: [
          { repo_name: 'anthropics/claude-code', description: 'CLI-based AI coding assistant that thinks and acts alongside you.', stars: '45.2k', language: 'TypeScript', why_trending: 'Revolutionary agentic coding tool gaining massive adoption.' },
          { repo_name: 'nicbarker/clay', description: 'High performance 2D UI layout library in C.', stars: '12.8k', language: 'C', why_trending: 'Minimal footprint UI layout for embedded and game dev.' },
          { repo_name: 'block/goose', description: 'Open-source AI developer agent that supercharges your terminal.', stars: '18.3k', language: 'Rust', why_trending: 'Alternative to proprietary coding agents with local model support.' },
          { repo_name: 'vercel/next.js', description: 'The React framework for production.', stars: '128k', language: 'TypeScript', why_trending: 'v15.2 release with improved turbopack and RSC streaming.' }
        ],
        content_recommendations: [
          { topic: 'AI Code Agent Comparison: Claude Code vs Cursor vs GitHub Copilot Workspace', format: 'Blog + Newsletter', target_audience: 'Senior developers, engineering managers', urgency: 'High', estimated_engagement: 'Very High -- controversial comparison content drives debate' },
          { topic: 'WebAssembly at the Edge: A Practical Performance Guide', format: 'Tutorial Blog', target_audience: 'Full-stack developers, DevOps engineers', urgency: 'Medium', estimated_engagement: 'High -- practical content with benchmarks performs well' },
          { topic: 'Rust vs Go vs TypeScript for Backend APIs in 2026', format: 'Blog + Social Thread', target_audience: 'Backend developers, architects', urgency: 'Medium', estimated_engagement: 'Very High -- language comparisons are perennial engagement drivers' }
        ],
        scan_timestamp: new Date().toISOString()
      })
      setRecipientEmail('dev-team@company.com')
      setEventTitle('React v4.2.0 Content Push')
      setEventDateTime('2024-01-16T09:00')
      setCalendarName('primary')
    } else {
      setRepoName('')
      setContentFocus('')
      setCampaigns([])
      setGeneratedContent(null)
      setDeliveryResult(null)
      setOptimizationResult(null)
      setTrendsResult(null)
      setMetricsForm({ campaign_name: '', open_rate: '', click_rate: '', shares: '', conversions: '' })
      setEditedEmail({ subject_line: '', preview_text: '', body: '', cta: '' })
      setEditedSocial({ twitter: '', linkedin: '', devto_title: '', devto_body: '' })
      setEditedBlog({ title: '', meta_description: '', body: '', tags: '' })
      setRecipientEmail('')
      setEventTitle('')
      setEventDateTime('')
      setCalendarName('primary')
    }
  }, [showSampleData])

  // Handler: Generate Content
  const handleGenerateContent = async () => {
    if (!repoName.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter a repository name' })
      return
    }
    setGenerating(true)
    setActiveAgentId(CONTENT_STRATEGY_COORDINATOR_ID)
    setStatusMessage({ type: 'loading', text: 'Generating developer content from GitHub activity...' })

    try {
      const message = `Generate developer marketing content for the GitHub repository: ${repoName.trim()}. ${contentFocus.trim() ? `Focus on: ${contentFocus.trim()}` : 'Cover recent activity including releases, commits, and PRs.'}`
      const result = await callAIAgent(message, CONTENT_STRATEGY_COORDINATOR_ID)

      if (result.success && result?.response?.result) {
        let data = result.response.result
        if (typeof data === 'string') {
          try { data = JSON.parse(data) } catch { /* keep as-is */ }
        }
        const parsed = data as ContentStrategyResponse
        setGeneratedContent(parsed)
        setStatusMessage({ type: 'success', text: 'Content generated successfully! Navigate to Review & Deliver to edit and send.' })

        const campaignTitle = parsed?.blog_content?.title || parsed?.email_content?.subject_line || 'Content Campaign'
        const newCampaign: Campaign = {
          id: String(campaigns.length + 1),
          title: campaignTitle,
          date: new Date().toISOString().split('T')[0],
          status: 'Draft',
          repo: repoName.trim(),
          formats: ['Email', 'Social', 'Blog']
        }
        setCampaigns(prev => [newCampaign, ...prev])
        setActiveScreen('review')
      } else {
        setStatusMessage({ type: 'error', text: result?.error || 'Failed to generate content. Please try again.' })
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'An error occurred while generating content.' })
    } finally {
      setGenerating(false)
      setActiveAgentId(null)
    }
  }

  // Handler: Schedule & Send
  const handleScheduleAndSend = async () => {
    if (!recipientEmail.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter a recipient email address' })
      return
    }
    setDelivering(true)
    setActiveAgentId(CONTENT_DELIVERY_AGENT_ID)
    setStatusMessage({ type: 'loading', text: 'Sending email and creating calendar events...' })

    try {
      let message = `Send the following email via Gmail:\n- To: ${recipientEmail.trim()}\n- Subject: ${editedEmail.subject_line}\n- Body: ${editedEmail.body}\n\n`
      if (eventTitle.trim() && eventDateTime.trim()) {
        message += `Also create a Google Calendar event:\n- Title: ${eventTitle.trim()}\n- Date/Time: ${eventDateTime.trim()}\n- Calendar: ${calendarName.trim() || 'primary'}`
      }

      const result = await callAIAgent(message, CONTENT_DELIVERY_AGENT_ID)

      if (result.success && result?.response?.result) {
        let data = result.response.result
        if (typeof data === 'string') {
          try { data = JSON.parse(data) } catch { /* keep as-is */ }
        }
        setDeliveryResult(data as ContentDeliveryResponse)
        setStatusMessage({ type: 'success', text: 'Content delivered successfully!' })

        setCampaigns(prev => prev.map((c, idx) => idx === 0 ? { ...c, status: 'Sent' as const } : c))
      } else {
        setStatusMessage({ type: 'error', text: result?.error || 'Failed to deliver content.' })
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'An error occurred during delivery.' })
    } finally {
      setDelivering(false)
      setActiveAgentId(null)
    }
  }

  // Handler: Analyze & Optimize
  const handleAnalyzeOptimize = async () => {
    if (!metricsForm.campaign_name.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter a campaign name' })
      return
    }
    setAnalyzing(true)
    setActiveAgentId(ENGAGEMENT_OPTIMIZER_AGENT_ID)
    setStatusMessage({ type: 'loading', text: 'Analyzing engagement data and generating optimization insights...' })

    try {
      const message = `Analyze the engagement metrics for the campaign "${metricsForm.campaign_name}": Open Rate: ${metricsForm.open_rate || 'N/A'}%, Click Rate: ${metricsForm.click_rate || 'N/A'}%, Total Shares: ${metricsForm.shares || 'N/A'}, Conversions: ${metricsForm.conversions || 'N/A'}. Provide performance analysis, A/B testing suggestions, engagement predictions, and optimization strategies.`
      const result = await callAIAgent(message, ENGAGEMENT_OPTIMIZER_AGENT_ID)

      if (result.success && result?.response?.result) {
        let data = result.response.result
        if (typeof data === 'string') {
          try { data = JSON.parse(data) } catch { /* keep as-is */ }
        }
        setOptimizationResult(data as EngagementOptimizerResponse)
        setStatusMessage({ type: 'success', text: 'Analysis complete! Review the optimization insights below.' })
      } else {
        setStatusMessage({ type: 'error', text: result?.error || 'Failed to analyze engagement data.' })
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'An error occurred during analysis.' })
    } finally {
      setAnalyzing(false)
      setActiveAgentId(null)
    }
  }

  // Handler: Scan Trends
  const handleScanTrends = async () => {
    setScanningTrends(true)
    setActiveAgentId(TREND_SCOUT_AGENT_ID)
    setStatusMessage({ type: 'loading', text: 'Scanning latest developer trends in real-time...' })

    try {
      const message = trendsDomain.trim()
        ? `Find the latest developer trends and trending topics in the ${trendsDomain.trim()} space. Include trending GitHub repos, hot topics from Hacker News/Reddit/Twitter, emerging technologies, and content recommendations.`
        : `Find the latest developer trends across all areas. Include trending GitHub repos this week, hot topics from Hacker News/Reddit/Twitter, emerging technologies, major industry movements, and content recommendations for developer advocates.`

      const result = await callAIAgent(message, TREND_SCOUT_AGENT_ID)

      if (result.success && result?.response?.result) {
        let data = result.response.result
        if (typeof data === 'string') {
          try { data = JSON.parse(data) } catch { /* keep as-is */ }
        }
        setTrendsResult(data as TrendScoutResponse)
        setStatusMessage({ type: 'success', text: 'Trend scan complete! Review the latest trends below.' })
      } else {
        setStatusMessage({ type: 'error', text: result?.error || 'Failed to scan trends.' })
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'An error occurred while scanning trends.' })
    } finally {
      setScanningTrends(false)
      setActiveAgentId(null)
    }
  }

  // Handler: Generate content from a trend
  const handleGenerateFromTrend = (trendName: string, contentAngle: string) => {
    setContentFocus(`Trending topic: ${trendName}. Content angle: ${contentAngle}`)
    setActiveScreen('dashboard')
    setStatusMessage({ type: 'success', text: `Trend "${trendName}" loaded into content focus. Click Generate Content to create content around it.` })
  }

  const navItems = [
    { key: 'dashboard' as const, label: 'Dashboard', icon: <FiLayers className="h-4 w-4" /> },
    { key: 'review' as const, label: 'Review & Deliver', icon: <FiSend className="h-4 w-4" /> },
    { key: 'analytics' as const, label: 'Analytics', icon: <HiOutlineChartBar className="h-4 w-4" /> },
    { key: 'trends' as const, label: 'Trends', icon: <FiTrendingUp className="h-4 w-4" /> },
  ]

  const twitterCharCount = editedSocial.twitter?.length ?? 0

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-background text-foreground font-sans">
        {/* Sidebar */}
        <div className="w-56 shrink-0 border-r border-border bg-card flex flex-col">
          {/* Brand */}
          <div className="px-4 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <VscGithub className="h-5 w-5 text-primary" />
              <span className="font-semibold text-sm font-mono tracking-tight">DevContent</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">Strategist</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-2">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveScreen(item.key)}
                className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${activeScreen === item.key ? 'bg-secondary text-foreground border-l-2 border-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Agent Status */}
          <div className="border-t border-border p-3">
            <p className="text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wider">Agents</p>
            <div className="space-y-1.5">
              {AGENTS.map((agent) => (
                <div key={agent.id} className="flex items-center gap-2">
                  <div className={`h-1.5 w-1.5 shrink-0 ${activeAgentId === agent.id ? 'bg-primary animate-pulse' : 'bg-muted-foreground/40'}`} />
                  <span className="text-xs text-muted-foreground truncate" title={agent.purpose}>{agent.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sample Data Toggle */}
          <div className="border-t border-border p-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="sample-toggle" className="text-xs text-muted-foreground">Sample Data</Label>
              <Switch id="sample-toggle" checked={showSampleData} onCheckedChange={setShowSampleData} />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-12 border-b border-border flex items-center justify-between px-4 bg-card shrink-0">
            <h1 className="text-sm font-semibold font-mono">
              {activeScreen === 'dashboard' && 'Dashboard'}
              {activeScreen === 'review' && 'Review & Deliver'}
              {activeScreen === 'analytics' && 'Analytics & Optimization'}
              {activeScreen === 'trends' && 'Trend Scanner'}
            </h1>
            <div className="flex items-center gap-2">
              {generating && <span className="text-xs text-primary flex items-center gap-1"><FiLoader className="h-3 w-3 animate-spin" /> Generating...</span>}
              {delivering && <span className="text-xs text-primary flex items-center gap-1"><FiLoader className="h-3 w-3 animate-spin" /> Delivering...</span>}
              {analyzing && <span className="text-xs text-primary flex items-center gap-1"><FiLoader className="h-3 w-3 animate-spin" /> Analyzing...</span>}
              {scanningTrends && <span className="text-xs text-primary flex items-center gap-1"><FiLoader className="h-3 w-3 animate-spin" /> Scanning trends...</span>}
            </div>
          </header>

          {/* Status Bar */}
          {statusMessage && (
            <div className="shrink-0">
              <StatusBar status={statusMessage} />
            </div>
          )}

          {/* Content Area */}
          <ScrollArea className="flex-1">
            <div className="p-4">
              {/* DASHBOARD SCREEN */}
              {activeScreen === 'dashboard' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Repository Input */}
                    <Card>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-mono flex items-center gap-2">
                          <VscGithub className="h-4 w-4" />
                          Generate Content
                        </CardTitle>
                        <CardDescription className="text-xs">Enter a GitHub repository to generate developer marketing content</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-2 space-y-3">
                        <div>
                          <Label htmlFor="repo-input" className="text-xs text-muted-foreground">Repository</Label>
                          <Input
                            id="repo-input"
                            placeholder="e.g., facebook/react"
                            value={repoName}
                            onChange={(e) => setRepoName(e.target.value)}
                            className="font-mono text-sm mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="focus-input" className="text-xs text-muted-foreground">Content Focus (optional)</Label>
                          <Input
                            id="focus-input"
                            placeholder="e.g., latest release, new feature"
                            value={contentFocus}
                            onChange={(e) => setContentFocus(e.target.value)}
                            className="text-sm mt-1"
                          />
                        </div>
                        <Button
                          onClick={handleGenerateContent}
                          disabled={generating || !repoName.trim()}
                          className="w-full"
                        >
                          {generating ? (
                            <span className="flex items-center gap-2"><FiLoader className="h-4 w-4 animate-spin" /> Generating...</span>
                          ) : (
                            <span className="flex items-center gap-2"><FiLayers className="h-4 w-4" /> Generate Content</span>
                          )}
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Activity Feed */}
                    <Card>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-mono flex items-center gap-2">
                          <FiActivity className="h-4 w-4" />
                          GitHub Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        {showSampleData ? (
                          <div className="divide-y divide-border">
                            {SAMPLE_ACTIVITY.map((item, i) => (
                              <ActivityItemRow key={i} item={item} />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <FiActivity className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Activity will appear after content generation</p>
                            <p className="text-xs text-muted-foreground mt-1">Toggle Sample Data to preview</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* GitHub Context Summary */}
                    {generatedContent?.github_context_summary && (
                      <Card>
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-sm font-mono flex items-center gap-2">
                            <VscGithub className="h-4 w-4" />
                            GitHub Context
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground">{generatedContent.github_context_summary}</p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Executive Summary */}
                    {generatedContent?.executive_summary && (
                      <Card>
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-sm font-mono flex items-center gap-2">
                            <HiOutlineDocumentText className="h-4 w-4" />
                            Executive Summary
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          {renderMarkdown(generatedContent.executive_summary)}
                        </CardContent>
                      </Card>
                    )}

                    {/* Key Themes */}
                    {Array.isArray(generatedContent?.key_themes) && (generatedContent?.key_themes?.length ?? 0) > 0 && (
                      <Card>
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-sm font-mono flex items-center gap-2">
                            <FiTarget className="h-4 w-4" />
                            Key Themes
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="flex flex-wrap gap-1.5">
                            {generatedContent.key_themes.map((theme, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{theme}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Right Column - Campaign History */}
                  <div className="space-y-4">
                    <Card>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-mono flex items-center gap-2">
                          <HiOutlineDocumentText className="h-4 w-4" />
                          Campaign History
                        </CardTitle>
                        <CardDescription className="text-xs">{campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        {campaigns.length > 0 ? (
                          <div className="space-y-2">
                            {campaigns.map((campaign) => (
                              <CampaignCard key={campaign.id} campaign={campaign} />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <FiLayers className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">No campaigns yet</p>
                            <p className="text-xs text-muted-foreground mt-1">Generate content to create your first campaign</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* REVIEW & DELIVER SCREEN */}
              {activeScreen === 'review' && (
                <div>
                  {!generatedContent && !showSampleData ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <FiEdit3 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground mb-1">No content generated yet</p>
                        <p className="text-xs text-muted-foreground mb-4">Generate content from the Dashboard first, or toggle Sample Data to preview.</p>
                        <Button variant="outline" onClick={() => setActiveScreen('dashboard')}>
                          <span className="flex items-center gap-2"><FiChevronRight className="h-4 w-4" /> Go to Dashboard</span>
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                      {/* Content Tabs - 2/3 width */}
                      <div className="xl:col-span-2">
                        <Tabs defaultValue="email" className="w-full">
                          <TabsList className="w-full justify-start">
                            <TabsTrigger value="email" className="gap-1 text-xs"><HiOutlineMail className="h-3 w-3" /> Email</TabsTrigger>
                            <TabsTrigger value="social" className="gap-1 text-xs"><FiTrendingUp className="h-3 w-3" /> Social</TabsTrigger>
                            <TabsTrigger value="blog" className="gap-1 text-xs"><HiOutlineDocumentText className="h-3 w-3" /> Blog</TabsTrigger>
                          </TabsList>

                          {/* Email Tab */}
                          <TabsContent value="email">
                            <Card>
                              <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-sm font-mono">Email Content</CardTitle>
                              </CardHeader>
                              <CardContent className="p-4 pt-2 space-y-3">
                                <div>
                                  <Label className="text-xs text-muted-foreground">Subject Line</Label>
                                  <Input
                                    value={editedEmail.subject_line}
                                    onChange={(e) => setEditedEmail(prev => ({ ...prev, subject_line: e.target.value }))}
                                    className="text-sm mt-1 font-mono"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Preview Text</Label>
                                  <Input
                                    value={editedEmail.preview_text}
                                    onChange={(e) => setEditedEmail(prev => ({ ...prev, preview_text: e.target.value }))}
                                    className="text-sm mt-1"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Email Body</Label>
                                  <Textarea
                                    value={editedEmail.body}
                                    onChange={(e) => setEditedEmail(prev => ({ ...prev, body: e.target.value }))}
                                    rows={12}
                                    className="text-sm mt-1 font-mono"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Call to Action</Label>
                                  <Input
                                    value={editedEmail.cta}
                                    onChange={(e) => setEditedEmail(prev => ({ ...prev, cta: e.target.value }))}
                                    className="text-sm mt-1"
                                  />
                                </div>
                                {/* Preview */}
                                {editedEmail.body && (
                                  <div className="border border-border p-4 bg-background">
                                    <p className="text-xs text-muted-foreground mb-2 font-mono uppercase tracking-wider">Preview</p>
                                    {renderMarkdown(editedEmail.body)}
                                    {editedEmail.cta && (
                                      <div className="mt-4">
                                        <span className="inline-block px-4 py-2 bg-primary text-primary-foreground text-sm font-medium">{editedEmail.cta}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </TabsContent>

                          {/* Social Tab */}
                          <TabsContent value="social">
                            <Card>
                              <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-sm font-mono">Social Media Content</CardTitle>
                              </CardHeader>
                              <CardContent className="p-4 pt-2 space-y-4">
                                {/* Twitter */}
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <Label className="text-xs text-muted-foreground">Twitter / X</Label>
                                    <span className={`text-xs font-mono ${twitterCharCount > 280 ? 'text-destructive' : 'text-muted-foreground'}`}>{twitterCharCount}/280</span>
                                  </div>
                                  <Textarea
                                    value={editedSocial.twitter}
                                    onChange={(e) => setEditedSocial(prev => ({ ...prev, twitter: e.target.value }))}
                                    rows={4}
                                    className="text-sm"
                                  />
                                  {twitterCharCount > 280 && (
                                    <p className="text-xs text-destructive mt-1">Exceeds 280 character limit</p>
                                  )}
                                </div>

                                <Separator />

                                {/* LinkedIn */}
                                <div>
                                  <Label className="text-xs text-muted-foreground">LinkedIn</Label>
                                  <Textarea
                                    value={editedSocial.linkedin}
                                    onChange={(e) => setEditedSocial(prev => ({ ...prev, linkedin: e.target.value }))}
                                    rows={8}
                                    className="text-sm mt-1"
                                  />
                                </div>

                                <Separator />

                                {/* Dev.to */}
                                <div>
                                  <Label className="text-xs text-muted-foreground">Dev.to Title</Label>
                                  <Input
                                    value={editedSocial.devto_title}
                                    onChange={(e) => setEditedSocial(prev => ({ ...prev, devto_title: e.target.value }))}
                                    className="text-sm mt-1 font-mono"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Dev.to Body</Label>
                                  <Textarea
                                    value={editedSocial.devto_body}
                                    onChange={(e) => setEditedSocial(prev => ({ ...prev, devto_body: e.target.value }))}
                                    rows={10}
                                    className="text-sm mt-1 font-mono"
                                  />
                                </div>
                                {editedSocial.devto_body && (
                                  <div className="border border-border p-4 bg-background">
                                    <p className="text-xs text-muted-foreground mb-2 font-mono uppercase tracking-wider">Dev.to Preview</p>
                                    {renderMarkdown(editedSocial.devto_body)}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </TabsContent>

                          {/* Blog Tab */}
                          <TabsContent value="blog">
                            <Card>
                              <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-sm font-mono">Blog Content</CardTitle>
                              </CardHeader>
                              <CardContent className="p-4 pt-2 space-y-3">
                                <div>
                                  <Label className="text-xs text-muted-foreground">Title</Label>
                                  <Input
                                    value={editedBlog.title}
                                    onChange={(e) => setEditedBlog(prev => ({ ...prev, title: e.target.value }))}
                                    className="text-sm mt-1 font-mono"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Meta Description</Label>
                                  <Textarea
                                    value={editedBlog.meta_description}
                                    onChange={(e) => setEditedBlog(prev => ({ ...prev, meta_description: e.target.value }))}
                                    rows={2}
                                    className="text-sm mt-1"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Tags (comma-separated)</Label>
                                  <Input
                                    value={editedBlog.tags}
                                    onChange={(e) => setEditedBlog(prev => ({ ...prev, tags: e.target.value }))}
                                    className="text-sm mt-1 font-mono"
                                    placeholder="react, javascript, web-development"
                                  />
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {editedBlog.tags.split(',').filter(t => t.trim()).map((tag, i) => (
                                      <Badge key={i} variant="outline" className="text-xs">{tag.trim()}</Badge>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Blog Body</Label>
                                  <Textarea
                                    value={editedBlog.body}
                                    onChange={(e) => setEditedBlog(prev => ({ ...prev, body: e.target.value }))}
                                    rows={14}
                                    className="text-sm mt-1 font-mono"
                                  />
                                </div>
                                {editedBlog.body && (
                                  <div className="border border-border p-4 bg-background">
                                    <p className="text-xs text-muted-foreground mb-2 font-mono uppercase tracking-wider">Blog Preview</p>
                                    {editedBlog.title && <h1 className="text-lg font-bold mb-2">{editedBlog.title}</h1>}
                                    {editedBlog.meta_description && <p className="text-sm text-muted-foreground mb-3 italic">{editedBlog.meta_description}</p>}
                                    {renderMarkdown(editedBlog.body)}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </TabsContent>
                        </Tabs>
                      </div>

                      {/* Right Sidebar - Delivery Settings */}
                      <div className="space-y-4">
                        <Card>
                          <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-mono flex items-center gap-2">
                              <HiOutlineMail className="h-4 w-4" />
                              Email Delivery
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-2 space-y-3">
                            <div>
                              <Label htmlFor="recipient-email" className="text-xs text-muted-foreground">Recipient Email *</Label>
                              <Input
                                id="recipient-email"
                                type="email"
                                placeholder="dev@company.com"
                                value={recipientEmail}
                                onChange={(e) => setRecipientEmail(e.target.value)}
                                className="text-sm mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Subject (from Email tab)</Label>
                              <p className="text-xs font-mono text-foreground mt-1 border border-border bg-background px-2 py-1.5 truncate">{editedEmail.subject_line || 'No subject set'}</p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-mono flex items-center gap-2">
                              <HiOutlineCalendar className="h-4 w-4" />
                              Calendar Event
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-2 space-y-3">
                            <div>
                              <Label htmlFor="event-title" className="text-xs text-muted-foreground">Event Title</Label>
                              <Input
                                id="event-title"
                                placeholder="Content Distribution Push"
                                value={eventTitle}
                                onChange={(e) => setEventTitle(e.target.value)}
                                className="text-sm mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="event-datetime" className="text-xs text-muted-foreground">Date & Time</Label>
                              <Input
                                id="event-datetime"
                                type="datetime-local"
                                value={eventDateTime}
                                onChange={(e) => setEventDateTime(e.target.value)}
                                className="text-sm mt-1 font-mono"
                              />
                            </div>
                            <div>
                              <Label htmlFor="calendar-name" className="text-xs text-muted-foreground">Calendar</Label>
                              <Input
                                id="calendar-name"
                                placeholder="primary"
                                value={calendarName}
                                onChange={(e) => setCalendarName(e.target.value)}
                                className="text-sm mt-1"
                              />
                            </div>
                          </CardContent>
                        </Card>

                        <Button
                          onClick={handleScheduleAndSend}
                          disabled={delivering || !recipientEmail.trim() || !editedEmail.subject_line}
                          className="w-full"
                        >
                          {delivering ? (
                            <span className="flex items-center gap-2"><FiLoader className="h-4 w-4 animate-spin" /> Sending...</span>
                          ) : (
                            <span className="flex items-center gap-2"><FiSend className="h-4 w-4" /> Schedule & Send</span>
                          )}
                        </Button>

                        {/* Delivery Results */}
                        {deliveryResult && (
                          <Card className="border-accent/30">
                            <CardHeader className="p-4 pb-2">
                              <CardTitle className="text-sm font-mono flex items-center gap-2 text-accent">
                                <FiCheckCircle className="h-4 w-4" />
                                Delivery Results
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-2 space-y-3">
                              {/* Email Delivery */}
                              {deliveryResult?.email_delivery && (
                                <div className="border border-border p-3 bg-background">
                                  <p className="text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wider">Email</p>
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-muted-foreground">Status</span>
                                      <Badge variant="outline" className="text-xs">{deliveryResult.email_delivery?.status ?? 'N/A'}</Badge>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-muted-foreground">Recipients</span>
                                      <span>{deliveryResult.email_delivery?.recipients_count ?? 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-muted-foreground">Subject</span>
                                      <span className="truncate max-w-[150px]">{deliveryResult.email_delivery?.subject ?? 'N/A'}</span>
                                    </div>
                                    {deliveryResult.email_delivery?.sent_at && (
                                      <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">Sent At</span>
                                        <span className="font-mono">{deliveryResult.email_delivery.sent_at}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Calendar Events */}
                              {Array.isArray(deliveryResult?.calendar_events) && deliveryResult.calendar_events.length > 0 && (
                                <div className="border border-border p-3 bg-background">
                                  <p className="text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wider">Calendar Events</p>
                                  <div className="space-y-2">
                                    {deliveryResult.calendar_events.map((evt, i) => (
                                      <div key={i} className="flex items-start gap-2 text-xs">
                                        <HiOutlineCalendar className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                                        <div>
                                          <p className="font-medium">{evt?.event_title ?? 'Untitled'}</p>
                                          <p className="text-muted-foreground">{evt?.date_time ?? ''} | {evt?.calendar ?? ''}</p>
                                          <Badge variant="outline" className="text-xs mt-0.5">{evt?.status ?? 'Unknown'}</Badge>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Delivery Summary */}
                              {deliveryResult?.delivery_summary && (
                                <div className="text-xs text-muted-foreground border-t border-border pt-2">
                                  {renderMarkdown(deliveryResult.delivery_summary)}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ANALYTICS SCREEN */}
              {activeScreen === 'analytics' && (
                <div className="space-y-4">
                  {/* Metrics Input */}
                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-mono flex items-center gap-2">
                        <BiAnalyse className="h-4 w-4" />
                        Engagement Metrics
                      </CardTitle>
                      <CardDescription className="text-xs">Enter campaign metrics to get AI-powered optimization insights</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Campaign Name *</Label>
                          <Input
                            placeholder="Campaign name"
                            value={metricsForm.campaign_name}
                            onChange={(e) => setMetricsForm(prev => ({ ...prev, campaign_name: e.target.value }))}
                            className="text-sm mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Open Rate (%)</Label>
                          <Input
                            type="number"
                            placeholder="e.g., 42"
                            value={metricsForm.open_rate}
                            onChange={(e) => setMetricsForm(prev => ({ ...prev, open_rate: e.target.value }))}
                            className="text-sm mt-1 font-mono"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Click Rate (%)</Label>
                          <Input
                            type="number"
                            placeholder="e.g., 6.8"
                            value={metricsForm.click_rate}
                            onChange={(e) => setMetricsForm(prev => ({ ...prev, click_rate: e.target.value }))}
                            className="text-sm mt-1 font-mono"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Shares</Label>
                          <Input
                            type="number"
                            placeholder="e.g., 150"
                            value={metricsForm.shares}
                            onChange={(e) => setMetricsForm(prev => ({ ...prev, shares: e.target.value }))}
                            className="text-sm mt-1 font-mono"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Conversions</Label>
                          <Input
                            type="number"
                            placeholder="e.g., 28"
                            value={metricsForm.conversions}
                            onChange={(e) => setMetricsForm(prev => ({ ...prev, conversions: e.target.value }))}
                            className="text-sm mt-1 font-mono"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={handleAnalyzeOptimize}
                        disabled={analyzing || !metricsForm.campaign_name.trim()}
                        className="mt-3"
                      >
                        {analyzing ? (
                          <span className="flex items-center gap-2"><FiLoader className="h-4 w-4 animate-spin" /> Analyzing...</span>
                        ) : (
                          <span className="flex items-center gap-2"><HiOutlineChartBar className="h-4 w-4" /> Analyze & Optimize</span>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Loading Skeleton */}
                  {analyzing && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <Card key={i}>
                          <CardContent className="p-4 space-y-3">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-4/5" />
                            <Skeleton className="h-3 w-2/3" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Results */}
                  {optimizationResult && !analyzing && (
                    <div className="space-y-4">
                      {/* Performance Summary */}
                      {optimizationResult?.performance_analysis && (
                        <Card>
                          <CardHeader className="p-4 pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm font-mono flex items-center gap-2">
                                <FiTarget className="h-4 w-4" />
                                Performance Summary
                              </CardTitle>
                              {optimizationResult.performance_analysis?.overall_score && (
                                <Badge className="text-sm font-mono">{optimizationResult.performance_analysis.overall_score}</Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 pt-2 space-y-3">
                            {optimizationResult.performance_analysis?.summary && (
                              <div>{renderMarkdown(optimizationResult.performance_analysis.summary)}</div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {/* Top Performers */}
                              <div className="border border-border p-3 bg-background">
                                <p className="text-xs font-mono text-accent mb-2 uppercase tracking-wider flex items-center gap-1"><FiTrendingUp className="h-3 w-3" /> Top Performers</p>
                                <ul className="space-y-1">
                                  {Array.isArray(optimizationResult.performance_analysis?.top_performers) && optimizationResult.performance_analysis.top_performers.map((item, i) => (
                                    <li key={i} className="text-xs flex items-start gap-2">
                                      <FiCheckCircle className="h-3 w-3 text-accent shrink-0 mt-0.5" />
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              {/* Areas for Improvement */}
                              <div className="border border-border p-3 bg-background">
                                <p className="text-xs font-mono text-destructive mb-2 uppercase tracking-wider flex items-center gap-1"><FiAlertCircle className="h-3 w-3" /> Areas for Improvement</p>
                                <ul className="space-y-1">
                                  {Array.isArray(optimizationResult.performance_analysis?.areas_for_improvement) && optimizationResult.performance_analysis.areas_for_improvement.map((item, i) => (
                                    <li key={i} className="text-xs flex items-start gap-2">
                                      <FiAlertCircle className="h-3 w-3 text-destructive shrink-0 mt-0.5" />
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* A/B Testing Suggestions */}
                      {Array.isArray(optimizationResult?.ab_testing_suggestions) && optimizationResult.ab_testing_suggestions.length > 0 && (
                        <Card>
                          <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-mono flex items-center gap-2">
                              <HiOutlineBeaker className="h-4 w-4" />
                              A/B Testing Suggestions
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {optimizationResult.ab_testing_suggestions.map((test, i) => (
                                <div key={i} className="border border-border p-3 bg-background space-y-2">
                                  <p className="text-sm font-medium">{test?.test_name ?? 'Unnamed Test'}</p>
                                  <p className="text-xs text-muted-foreground">{test?.hypothesis ?? ''}</p>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="border border-border p-2 bg-card">
                                      <p className="text-xs font-mono text-muted-foreground mb-0.5">Variant A</p>
                                      <p className="text-xs">{test?.variant_a ?? 'N/A'}</p>
                                    </div>
                                    <div className="border border-border p-2 bg-card">
                                      <p className="text-xs font-mono text-muted-foreground mb-0.5">Variant B</p>
                                      <p className="text-xs">{test?.variant_b ?? 'N/A'}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Expected: <span className="text-accent">{test?.expected_impact ?? 'N/A'}</span></span>
                                    <Badge variant="outline" className="text-xs">{test?.metric_to_track ?? ''}</Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Engagement Predictions */}
                      {Array.isArray(optimizationResult?.engagement_predictions) && optimizationResult.engagement_predictions.length > 0 && (
                        <Card>
                          <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-mono flex items-center gap-2">
                              <FiTrendingUp className="h-4 w-4" />
                              Engagement Predictions
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-2">
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-border">
                                    <th className="text-left py-2 px-2 text-xs font-mono text-muted-foreground">Topic</th>
                                    <th className="text-left py-2 px-2 text-xs font-mono text-muted-foreground">Open Rate</th>
                                    <th className="text-left py-2 px-2 text-xs font-mono text-muted-foreground">Click Rate</th>
                                    <th className="text-left py-2 px-2 text-xs font-mono text-muted-foreground">Confidence</th>
                                    <th className="text-left py-2 px-2 text-xs font-mono text-muted-foreground">Reasoning</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {optimizationResult.engagement_predictions.map((pred, i) => {
                                    const confidenceColors: Record<string, string> = {
                                      'Very High': 'text-accent',
                                      'High': 'text-primary',
                                      'Medium': 'text-muted-foreground',
                                      'Low': 'text-destructive'
                                    }
                                    return (
                                      <tr key={i} className="border-b border-border last:border-0">
                                        <td className="py-2 px-2 text-xs font-medium">{pred?.topic ?? 'N/A'}</td>
                                        <td className="py-2 px-2 text-xs font-mono">{pred?.predicted_open_rate ?? 'N/A'}</td>
                                        <td className="py-2 px-2 text-xs font-mono">{pred?.predicted_click_rate ?? 'N/A'}</td>
                                        <td className="py-2 px-2 text-xs"><span className={confidenceColors[pred?.confidence ?? ''] || 'text-foreground'}>{pred?.confidence ?? 'N/A'}</span></td>
                                        <td className="py-2 px-2 text-xs text-muted-foreground max-w-[250px]">{pred?.reasoning ?? ''}</td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Optimization Strategies */}
                      {Array.isArray(optimizationResult?.optimization_strategies) && optimizationResult.optimization_strategies.length > 0 && (
                        <Card>
                          <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-mono flex items-center gap-2">
                              <HiOutlineLightBulb className="h-4 w-4" />
                              Optimization Strategies
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-2">
                            <div className="space-y-3">
                              {optimizationResult.optimization_strategies.map((strat, i) => {
                                const impactColors: Record<string, string> = {
                                  'High': 'bg-accent/20 text-accent border-accent/30',
                                  'Medium': 'bg-primary/20 text-primary border-primary/30',
                                  'Low': 'bg-muted text-muted-foreground border-border'
                                }
                                const effortColors: Record<string, string> = {
                                  'Low': 'text-accent',
                                  'Medium': 'text-primary',
                                  'High': 'text-destructive'
                                }
                                return (
                                  <div key={i} className="border border-border p-3 bg-background">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                      <div className="flex items-center gap-2">
                                        <PriorityBadge priority={strat?.priority ?? 'P3'} />
                                        <p className="text-sm font-medium">{strat?.strategy ?? 'Unnamed Strategy'}</p>
                                      </div>
                                      <span className={`inline-flex items-center px-1.5 py-0.5 text-xs border ${impactColors[strat?.expected_impact ?? ''] || impactColors.Low}`}>{strat?.expected_impact ?? 'N/A'} impact</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">{strat?.description ?? ''}</p>
                                    <div className="flex items-center gap-3 mt-2 text-xs">
                                      <span className="text-muted-foreground">Effort: <span className={effortColors[strat?.implementation_effort ?? ''] || 'text-foreground'}>{strat?.implementation_effort ?? 'N/A'}</span></span>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}

                  {/* Empty state when no results and not analyzing */}
                  {!optimizationResult && !analyzing && (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <HiOutlineChartBar className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground mb-1">No analysis results yet</p>
                        <p className="text-xs text-muted-foreground">Enter campaign metrics above and click Analyze & Optimize</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* TRENDS SCREEN */}
              {activeScreen === 'trends' && (
                <div className="space-y-4">
                  {/* Scan Controls */}
                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-mono flex items-center gap-2">
                        <FiTrendingUp className="h-4 w-4" />
                        Trend Scanner
                      </CardTitle>
                      <CardDescription className="text-xs">Powered by Perplexity AI -- scans the web in real-time for developer trends</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-2 space-y-3">
                      <div>
                        <Label htmlFor="trends-domain" className="text-xs text-muted-foreground">Domain / Niche (optional)</Label>
                        <Input
                          id="trends-domain"
                          placeholder="e.g., AI, web development, mobile, DevOps"
                          value={trendsDomain}
                          onChange={(e) => setTrendsDomain(e.target.value)}
                          className="text-sm mt-1"
                        />
                      </div>
                      <Button
                        onClick={handleScanTrends}
                        disabled={scanningTrends}
                        className="w-full"
                      >
                        {scanningTrends ? (
                          <span className="flex items-center gap-2"><FiLoader className="h-4 w-4 animate-spin" /> Scanning...</span>
                        ) : (
                          <span className="flex items-center gap-2"><FiTrendingUp className="h-4 w-4" /> Scan Trends</span>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Loading Skeleton */}
                  {scanningTrends && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i}>
                          <CardContent className="p-4 space-y-3">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-4/5" />
                            <Skeleton className="h-3 w-2/3" />
                            <Skeleton className="h-8 w-1/2 mt-2" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Trends Results */}
                  {trendsResult && !scanningTrends && (
                    <div className="space-y-4">
                      {/* Trends Summary */}
                      {trendsResult?.trends_summary && (
                        <Card>
                          <CardHeader className="p-4 pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm font-mono flex items-center gap-2">
                                <FiTarget className="h-4 w-4" />
                                Trends Summary
                              </CardTitle>
                              {trendsResult?.scan_timestamp && (
                                <Badge variant="outline" className="text-xs font-mono">{trendsResult.scan_timestamp}</Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 pt-2">
                            {renderMarkdown(trendsResult.trends_summary)}
                          </CardContent>
                        </Card>
                      )}

                      {/* Trending Topics */}
                      {Array.isArray(trendsResult?.trending_topics) && trendsResult.trending_topics.length > 0 && (
                        <div>
                          <h3 className="text-sm font-mono font-semibold mb-3 flex items-center gap-2">
                            <FiTrendingUp className="h-4 w-4" />
                            Trending Topics
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                            {trendsResult.trending_topics.map((topic, i) => {
                              const momentumColors: Record<string, string> = {
                                'Rising': 'bg-accent/20 text-accent border-accent/30',
                                'Peaking': 'bg-primary/20 text-primary border-primary/30',
                                'Declining': 'bg-destructive/20 text-destructive border-destructive/30'
                              }
                              return (
                                <Card key={i}>
                                  <CardContent className="p-4 space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                      <p className="text-sm font-semibold">{topic?.trend_name ?? 'Untitled'}</p>
                                      <span className={`inline-flex items-center px-1.5 py-0.5 text-xs border shrink-0 ${momentumColors[topic?.momentum ?? ''] || 'bg-muted text-muted-foreground border-border'}`}>{topic?.momentum ?? 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <Badge variant="secondary" className="text-xs">{topic?.category ?? 'General'}</Badge>
                                    </div>
                                    <p className="text-xs text-foreground">{topic?.description ?? ''}</p>
                                    <p className="text-xs text-muted-foreground">{topic?.why_it_matters ?? ''}</p>
                                    {topic?.content_angle && (
                                      <div className="flex items-start gap-1.5 border border-border p-2 bg-background">
                                        <HiOutlineLightBulb className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                                        <p className="text-xs text-foreground">{topic.content_angle}</p>
                                      </div>
                                    )}
                                    {topic?.source && (
                                      <p className="text-xs text-muted-foreground font-mono">{topic.source}</p>
                                    )}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full mt-1 text-xs"
                                      onClick={() => handleGenerateFromTrend(topic?.trend_name ?? '', topic?.content_angle ?? '')}
                                    >
                                      <span className="flex items-center gap-1.5"><FiEdit3 className="h-3 w-3" /> Create Content</span>
                                    </Button>
                                  </CardContent>
                                </Card>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Trending Repos */}
                      {Array.isArray(trendsResult?.trending_repos) && trendsResult.trending_repos.length > 0 && (
                        <Card>
                          <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-mono flex items-center gap-2">
                              <VscGithub className="h-4 w-4" />
                              Trending Repositories
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-2">
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-border">
                                    <th className="text-left py-2 px-2 text-xs font-mono text-muted-foreground">Repository</th>
                                    <th className="text-left py-2 px-2 text-xs font-mono text-muted-foreground">Description</th>
                                    <th className="text-left py-2 px-2 text-xs font-mono text-muted-foreground">Stars</th>
                                    <th className="text-left py-2 px-2 text-xs font-mono text-muted-foreground">Language</th>
                                    <th className="text-left py-2 px-2 text-xs font-mono text-muted-foreground">Why Trending</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {trendsResult.trending_repos.map((repo, i) => (
                                    <tr key={i} className="border-b border-border last:border-0">
                                      <td className="py-2 px-2 text-xs font-mono font-medium">
                                        <span className="flex items-center gap-1.5">
                                          <VscGithub className="h-3 w-3 shrink-0" />
                                          {repo?.repo_name ?? 'N/A'}
                                        </span>
                                      </td>
                                      <td className="py-2 px-2 text-xs text-muted-foreground max-w-[200px]">{repo?.description ?? ''}</td>
                                      <td className="py-2 px-2 text-xs font-mono">
                                        <span className="flex items-center gap-1">
                                          <FiStar className="h-3 w-3 text-primary" />
                                          {repo?.stars ?? 'N/A'}
                                        </span>
                                      </td>
                                      <td className="py-2 px-2 text-xs">
                                        <Badge variant="outline" className="text-xs">{repo?.language ?? 'N/A'}</Badge>
                                      </td>
                                      <td className="py-2 px-2 text-xs text-muted-foreground max-w-[250px]">{repo?.why_trending ?? ''}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Content Recommendations */}
                      {Array.isArray(trendsResult?.content_recommendations) && trendsResult.content_recommendations.length > 0 && (
                        <div>
                          <h3 className="text-sm font-mono font-semibold mb-3 flex items-center gap-2">
                            <HiOutlineLightBulb className="h-4 w-4" />
                            Content Recommendations
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {trendsResult.content_recommendations.map((rec, i) => {
                              const urgencyColors: Record<string, string> = {
                                'High': 'bg-destructive/20 text-destructive border-destructive/30',
                                'Medium': 'bg-primary/20 text-primary border-primary/30',
                                'Low': 'bg-muted text-muted-foreground border-border'
                              }
                              return (
                                <Card key={i}>
                                  <CardContent className="p-4 space-y-2">
                                    <p className="text-sm font-semibold">{rec?.topic ?? 'Untitled'}</p>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <Badge variant="secondary" className="text-xs">{rec?.format ?? 'Content'}</Badge>
                                      <span className={`inline-flex items-center px-1.5 py-0.5 text-xs border ${urgencyColors[rec?.urgency ?? ''] || urgencyColors.Low}`}>{rec?.urgency ?? 'N/A'} urgency</span>
                                    </div>
                                    <div className="text-xs space-y-1">
                                      <p className="text-muted-foreground"><span className="font-mono">Audience:</span> {rec?.target_audience ?? 'N/A'}</p>
                                      <p className="text-muted-foreground"><span className="font-mono">Engagement:</span> {rec?.estimated_engagement ?? 'N/A'}</p>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full mt-1 text-xs"
                                      onClick={() => handleGenerateFromTrend(rec?.topic ?? '', rec?.format ?? '')}
                                    >
                                      <span className="flex items-center gap-1.5"><FiEdit3 className="h-3 w-3" /> Create Content</span>
                                    </Button>
                                  </CardContent>
                                </Card>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Empty state */}
                  {!trendsResult && !scanningTrends && (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <FiTrendingUp className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground mb-1">No trends scanned yet</p>
                        <p className="text-xs text-muted-foreground">Optionally enter a domain above and click Scan Trends to discover what is hot in the developer world right now</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </ErrorBoundary>
  )
}

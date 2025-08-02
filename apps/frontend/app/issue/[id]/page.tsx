import { IssueDetailPage } from "@/components/issue-detail-page"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function IssueDetailPageRoute({ params }: PageProps) {
  const { id } = await params
  return <IssueDetailPage issueId={id} />
}

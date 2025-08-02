import { IssueDetailPage } from "@/components/issue-detail-page"

export default function IssueDetailPageRoute({ params }: { params: { id: string } }) {
  return <IssueDetailPage issueId={params.id} />
}

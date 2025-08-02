import { IssueDetail } from "@/components/issue-detail"

export default function IssueDetailPage({ params }: { params: { id: string } }) {
  return <IssueDetail issueId={params.id} />
}

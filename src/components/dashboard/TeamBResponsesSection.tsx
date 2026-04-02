/**
 * Legacy path kept so Tailwind’s incremental content tracker (and stale .next
 * manifests) never stat() a missing file after the calculator UI moved into
 * the main report breakdown. Renders nothing.
 */
export default function TeamBResponsesSection() {
  return null;
}

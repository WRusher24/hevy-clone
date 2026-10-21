import { Button } from "@chakra-ui/react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="page page-narrow">
      <div className="card" style={{ padding: "56px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 42, fontWeight: 900, letterSpacing: "-0.04em" }}>404</div>
        <p className="page-subtitle" style={{ marginBottom: 18 }}>
          That page does not exist. It may have been moved or deleted.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <Button size="sm" as={Link} to="/">
            Back to feed
          </Button>
          <Button size="sm" variant="ghost" as={Link} to="/routines">
            Routines
          </Button>
        </div>
      </div>
    </div>
  );
}

import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the feed page with seeded content", () => {
  render(<App />);
  expect(screen.getByRole("heading", { name: /feed/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /log workout/i })).toBeInTheDocument();
});

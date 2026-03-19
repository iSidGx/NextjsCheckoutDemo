import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home", () => {
  it("renders the product catalog hero and search", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        name: /build a basket of custom mugs with live design previews/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/search mugs/i)).toBeInTheDocument();
  });
});
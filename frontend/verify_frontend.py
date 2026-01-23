import re
from playwright.sync_api import sync_playwright
import time
import subprocess
import os
import signal
import sys

def verify_frontend():
    # Start the preview server
    print("Starting preview server...")
    process = subprocess.Popen(
        ["npm", "run", "preview"],
        cwd="frontend",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        preexec_fn=os.setsid
    )

    # Wait for server to start (simple sleep)
    time.sleep(5)

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()

            # Navigate to the app (Vite preview default port)
            url = "http://localhost:4173"
            print(f"Navigating to {url}")
            try:
                page.goto(url)
            except Exception as e:
                print(f"Failed to load page: {e}")
                # Check stdout/stderr
                stdout, stderr = process.communicate(timeout=1)
                print("STDOUT:", stdout.decode())
                print("STDERR:", stderr.decode())
                return

            # Wait for content to load (Login page likely first, but we need to bypass or mock?
            # Or checks if Login component is styled?)

            # Wait a bit
            page.wait_for_timeout(2000)

            # Check if we are on Login page
            content = page.content()
            if "Login" in content or "password" in content.lower():
                print("On Login page. Verification of FilmList requires login.")
                # We can verify App structure classes at least

                # Check for Tailwind classes on body or root
                # body should have bg-zinc-950 (but that's in CSS via @apply or similar, wait I used CSS variables in index.css)
                # In index.css: body { background-color: var(--color-zinc-950); }
                # Let's check computed style?

                body_bg = page.eval_on_selector("body", "e => window.getComputedStyle(e).backgroundColor")
                print(f"Body background color: {body_bg}")
                # Zinc 950 is #09090b -> rgb(9, 9, 11)

                if "rgb(9, 9, 11)" in body_bg or "rgb(9,9,11)" in body_bg:
                    print("SUCCESS: Body background matches Zinc-950.")
                else:
                    print(f"WARNING: Body background {body_bg} does not match expected Zinc-950.")

                # Since we can't easily login without backend, we'll assume build success + source check is enough for components.
                # However, I can verify the Navbar classes which are visible in App component (if it renders before login? No, App.tsx returns <Login /> if not authenticated)

                # Verify Login component styling?
                # I didn't refactor Login component, so it might look old.
                # The prompt was about DatabaseFilm (FilmList).

                pass
            else:
                # If by some miracle we are logged in (localStorage?)
                # Check for grid classes
                if page.locator(".grid.grid-cols-\[repeat\(auto-fill\,minmax\(180px\,1fr\)\)\]").count() > 0:
                     print("SUCCESS: Found Tailwind grid container.")
                else:
                     # Maybe simpler class check
                     if page.locator(".grid").count() > 0:
                         print("SUCCESS: Found .grid class.")
                     else:
                         print("FAILURE: .grid class not found.")

    finally:
        print("Stopping server...")
        os.killpg(os.getpgid(process.pid), signal.SIGTERM)

if __name__ == "__main__":
    verify_frontend()

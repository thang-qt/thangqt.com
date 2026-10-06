#import "@preview/silver-dev-cv:1.0.1": *

#show: cv.with(
  font-type: "Lato",
  continue-header: "false",
  name: "Tô Quang Thắng",
  address: "Hanoi, Vietnam",
  lastupdated: "false",
  pagecount: "false",
  date: "2026-05-12",
  contacts: (
    (text: "+84387000902", link: "tel:0387000902"),
    (text: "thang@thangqt.com", link: "mailto:thang@thangqt.com"),
    (text: "thangqt.com", link: "https://thangqt.com"),
    (text: "github.com/thang-qt", link: "https://www.github.com/thang-qt"),
  ),
)

#section[About Me]
#descript[
Computer Science student with hands-on experience building full-stack web applications, internal tools, and coding platforms. Comfortable working in Linux and across backend/frontend workflows, with a focus on clean architecture, testing, and practical product delivery.
]

#section("Skills")
#oneline-title-item(
  title: "Languages",
  content: [C++, Java, Python, JavaScript, TypeScript, Go]
)
#oneline-title-item(
  title: "Frameworks & Data",
  content: [React, Next.js, NestJS, Vite, PostgreSQL, Supabase]
)
#oneline-title-item(
  title: "Tools & Platforms",
  content: [Linux, Docker, Git, Nix, Cloudflare Workers]
)
#oneline-title-item(
  title: "Spoken Languages",
  content: [Vietnamese (Native), English (Working proficiency)]
)

#sectionsep

#section("Experience")
#job(
  position: "Full Stack Developer (Contract)",
  institution: [BAP IT Co., JSC],
  location: "Hanoi",
  date: "Jun 2026 - Present",
  description: [
    - Analyzed business requirements and ERP migration workflows for an early-stage client demo; refactored the codebase, added CI, and brought the test suite to a passing state.
    - Implemented S3 file uploads and handling, background job queues, and vision-LLM receipt detail extraction.
    - Investigated and built a Three.js feasibility demo for 3D previews and thumbnail generation across multiple file formats.
  ],
)

#job(
  position: "Full Stack Developer Intern",
  institution: [BAP IT Co., JSC],
  location: "Hanoi",
  date: "Feb 2026 - Jun 2026",
  description: [
    - Built dashboard workflows, question and session management, JWT authentication, role-based access control, and candidate invitations for an internal coding/interview platform.
    - Integrated Judge0 code execution and prototyped real-time collaboration with Yjs/WebSocket.
    - Set up Jest/Playwright testing and CI; built a Codeforces Parquet importer to bulk-seed the question bank.
  ],
)

#sectionsep

#section("Projects")

#project(
  title: [Ngàn Lá],
  date: [2025 - 2026],
  description: text(weight: "regular")[
    Online exam platform for Vietnamese high school students with textbook mapping and analytics.
    - Built with Next.js, Go (Chi) backend, and shadcn/ui; structured content by grade, subject, and textbook chapter.
    - Developed automated content crawlers and an LLM-assisted workflow to generate and bulk-import exam questions.
    - Implemented SePay QR payment flow with API/webhook-based payment confirmation.
  ]
)

#project(
  title: [Respond],
  date: [2026],
  description: text(weight: "regular")[
    Structured 1v1 debate platform with temporary anonymity and turn-based exchanges.
    - Built the full-stack product end to end, from debate creation and invites to user profiles, post-debate discussion, and admin moderation.
    - Designed the timed debate lifecycle with alternating turns, temporary anonymity, multiple ending conditions, and realtime updates and notifications.
  ]
)

#sectionsep

#section("Education")
#education(
  institution: [VNU University of Engineering and Technology],
  major: [Computer Science],
  date: "2023 - 2027",
  location: "Hanoi"
)

---
title: "MindForm: AI-powered document generation"
description: Building an AI tool to convert images into polished PDF documents
date: 2025-06-20
tags:
  - llm
  - project
cover: ./landing.png
---

## Original inspiration

I was working on a study material sharing website. Often, when new exams come up, people capture the exam papers and upload them to Facebook. This works for those who just want a quick look at the questions. However, for people who want to actually solve the exams, a well-formatted document, usually a PDF, is much more useful. 

This made me realize there was a big opportunity for my website. If I could find a way to quickly convert images into polished PDF documents faster than my competitors, it could attract a lot of users.

## The idea

Manually creating a document from images is not only time-consuming but also requires a lot of effort to make it look professional. So, I thought, why not use AI to generate the document for me? But how could I do that?

Most people use MS Word to compose documents and then export them to PDF. Unfortunately, there's no straightforward way to use AI to generate documents in MS Word or PDF formats. Markdown is too basic and lacks advanced formatting options. LaTeX seemed promising, but it's too complex for AI and not suitable for most document generation tasks.

That's when I thought of using HTML. Current models like GPT, Claude, and Gemini are already good at generating complex websites, so creating a simple HTML document should be manageable. Plus, HTML can be converted to PDF. I've used the browser's built-in "print to PDF" feature to save webpages before, so I knew it was possible. 

This became the plan: use AI to generate HTML documents and then convert them to PDF. If implemented well, it could save a lot of time and effort.

## The implementation

I started by experimenting with Google AI Studio's build features, which helped me quickly create a prototype. However, the generated HTML wasn't great and didn't preserve the formatting of the original images. Pure JavaScript-based HTML-to-PDF conversion also didn't work well, so I had to explore server-side solutions. Unfortunately, Google AI Studio didn't allow me to change the model used in the prototype or support server-side code. 

This meant I had to build everything from scratch, with the help of LLMs, of course. The first step was designing the website. I used v0 to generate the frontend design. After several iterations, I finally had a design I was happy with.

Before diving deeper, I researched efficient ways to convert HTML to PDF. That's when I discovered WeasyPrint, a Python-based tool. Since I was already familiar with Python and had recently built a chess web app with FastAPI, it seemed like a good fit. I fired up VS Code, downloaded the code from v0, and started implementing. With GitHub Copilot's help, I quickly had a working prototype.

The quality of the generated HTML was hit or miss, but I decided to move forward. It wasn't perfect, but it was better than nothing. I planned to turn this into a commercial product. Even if it failed, I'd learn a lot and have something to showcase my skills. 

To make it commercially viable, I added features like document generation from scratch based on user input. I also built a library of pre-made templates so users could pick one and customize it with AI. After some research, I realized there wasn't a well-known product offering this, making it a niche with great potential. Despite having a few final exams coming up, I decided to keep working on it.

Fast forward a few weeks, I had a beautiful website, a working backend, and a few templates. I even implemented usage tracking and a pricing model. The only thing missing was the billing system. 

Excitedly, I began testing the app thoroughly. Unfortunately, the generated documents weren't very good. The biggest issue was PDF conversion, it often resulted in different styling from the original HTML, with misplaced page breaks and other problems. This seemed to be a limitation of current LLMs, partly because they can't control layouts or see the final output.

## Lessons learned

The concept is solid, but I need a better way to handle PDF generation. After more research, I discovered Typst, which looked promising. However, I was disappointed to find very few libraries for it. Worse, current models don't seem to have enough training data on Typst, leading to poor syntax generation.

At this point, I decided to pause the project and treat it as an experiment. I can always revisit it later when better solutions become available.

## Preview

Below are screenshots of the website. It's honestly one of the best-looking websites I've ever made, and I'm really proud of it. I hope to return to this project someday and turn it into a successful product.

![Landing page](./landing.png)

![Text generation](./text-generation.png)

![Document preview](./document-preview.png)

![Image generation](./image-generation.png)

![Templates](./templates.png)

I still keep the code in a private repository. However, it's quite messy, so I don't plan to release it as an open-source project.

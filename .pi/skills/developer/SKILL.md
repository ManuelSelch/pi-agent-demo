---
name: developer
description: this skill allows to write code in TDD style in small simple steps
---

# SKILL.md — Agent Developer

This document outlines the core skills, competencies, and expectations for an **Agent Developer**. It can be used for hiring, onboarding, self‑assessment, or career development.

---

## 1. Core Technical Skills

### Input
- read input from ./REQUIREMENTS.md file
- this is your input content of all requirements to implement

### Test-Driven Development (TDD) — Core Principle

* Strong, disciplined practice of **Test-Driven Development** as the default workflow
* Follows the strict **Red → Green → Refactor** cycle:

  * **Red**: Write a simple, failing test that defines the next tiny behavior
  * **Green**: Implement the minimal code required to make the test pass
  * **Refactor**: Improve structure and clarity without changing behavior
* Treats tests as the primary design tool, not a safety net added later
* Prefers many small tests over few complex ones

### Small-Step Development

* Works exclusively in **tiny, incremental steps**
* Avoids large commits or broad changes
* If a task feels too large, it is **explicitly split into smaller, testable steps** before coding
* Each step should:

  * Be independently testable
  * Take only a few minutes to implement
  * Move the system forward in a measurable way

### Programming & Software Engineering

* Proficiency in at least one general-purpose language (Python, TypeScript/JavaScript, Java, or Go)
* Strong understanding of software engineering fundamentals:

  * Data structures & algorithms
  * Modular design and clean architecture
  * Version control (Git)
* Ability to write readable, testable, and maintainable code

---

## 2. Tooling & Infrastructure

### Agent Frameworks & Libraries

* Hands‑on experience with at least one agent or LLM framework, such as:

  * LangChain / LangGraph
  * LlamaIndex
  * OpenAI / Anthropic / open‑source model SDKs
* Ability to evaluate and extend frameworks rather than relying on defaults

### APIs & Integrations

* Designing and consuming REST or GraphQL APIs
* Integrating agents with external tools and services (databases, search, internal systems)
* Managing authentication, rate limits, and error handling

### Data & Storage

* Experience with:

  * Vector databases (e.g., FAISS, Pinecone, Weaviate)
  * Relational or NoSQL databases
* Designing schemas for agent memory, logs, and traces

---

## 3. Reliability, Safety & Evaluation

### Test Design & Quality

* Writes **clear, intention-revealing tests** that describe behavior, not implementation
* Uses tests to:

  * Drive API and interface design
  * Clarify ambiguous requirements
  * Prevent regressions
* Keeps tests:

  * Fast
  * Deterministic
  * Isolated

### Refactoring Discipline

* Refactors only when tests are green
* Continuously improves:

  * Naming
  * Structure
  * Duplication
* Uses refactoring as a first-class activity, not an afterthought

### Debugging & Observability

* Ability to debug agent behavior by:

  * Narrowing failures to the smallest possible step
  * Writing a new test that reproduces the issue
* Root-cause analysis focused on behavior, not symptoms

---

## 4. Product & System Thinking

### Problem Framing

* Translating ambiguous user needs into well‑scoped agent tasks
* Deciding when an agent is appropriate vs. a traditional system

### UX for Agent Systems

* Designing clear inputs and outputs for agents
* Managing uncertainty and partial results in user‑facing systems
* Building feedback loops to improve agent performance over time

### Performance & Cost Awareness

* Optimizing prompt length, model choice, and tool usage
* Balancing quality, latency, and operational cost

---

## 5. Collaboration & Communication

### Cross‑Functional Work

* Collaborating with product managers, designers, and domain experts
* Explaining agent behavior and limitations to non‑technical stakeholders

### Documentation

* Writing clear documentation for:

  * Agent behavior and decision logic
  * Prompts and system instructions
  * Known limitations and failure cases

### Ownership & Iteration

* Taking ownership of agent systems in production
* Iterating quickly based on real‑world feedback and metrics

---

## 6. Nice‑to‑Have Skills

* Experience with open‑source LLMs and fine‑tuning
* Background in distributed systems or backend infrastructure
* Familiarity with compliance, privacy, or regulated environments
* Research literacy (reading and applying ML / AI papers)

---

## 7. Mindset

A strong Agent Developer with a TDD mindset:

* Believes **working software emerges from small, verified steps**
* Never writes production code without a failing test
* Prefers progress through many tiny commits over big leaps
* Actively resists over-engineering
* Treats uncertainty as a signal to write a smaller test
* Is comfortable going "slow" locally to move fast safely in production
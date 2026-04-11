# NatWest Group — Code for Purpose: India Hackathon
## Submission Guidelines & Terms

> Please read carefully and ensure your project complies with **all sections** before submission.

---

## 1. Required Submission Items

### 1.1 README.md (Project Documentation)

Your `README.md` is the **main documentation** for your project. It must be clear enough for someone unfamiliar with your work to understand and run it.

#### i. Overview
A short description (2–5 sentences) covering:
- What your project does
- What problem it solves
- Who the intended users are

#### ii. Features
- A bullet list of features that are **implemented and working**
- Do **not** list planned or future features as if they already exist

#### iii. Install & Run Instructions
- Step-by-step instructions to install dependencies and run the project
- Assume the reader has basic technical skills but **no prior knowledge** of your code

#### iv. Tech Stack
List the main technologies used:
- Programming languages
- Frameworks
- Databases
- Cloud services
- AI/ML libraries or models

#### v. Usage Examples
Show how to use the project once running. You may include:
- Command examples
- Example API calls
- Sample inputs/outputs
- Screenshots (if applicable)

#### vi. Optional but Recommended Sections
- **Architecture notes** — short explanation of how the system is structured (e.g., frontend, backend, database, external APIs)
- **Limitations** — honest description of what does not work or is not fully implemented
- **Future improvements** — features or changes you would make with more time

---

## 2. Codebase Requirements

Your repository must contain **everything needed** to understand and run your project.

### 2.1 Complete Source Code
- Include all source files (`.py`, `.js`, `.ts`, `.html`, `.css`, etc.)
- Ensure no imported modules or files are missing
- Test by cloning your repo to a new location and following your own setup instructions

### 2.2 Dependency Files
Provide the necessary configuration for installing dependencies:

| Stack | File |
|---|---|
| Python | `requirements.txt` or `pyproject.toml` |
| Node.js | `package.json` (optionally `package-lock.json` / `yarn.lock` / `pnpm-lock.yaml`) |
| Conda | `environment.yml` |

These files must allow judges to install dependencies with standard commands:
```bash
pip install -r requirements.txt
npm install
conda env create -f environment.yml
```

### 2.3 Configuration Files
- Include a `.env.example` listing **all required environment variables**
- **Do not** include real passwords, API keys, or confidential data
- You may also include:
  - Configuration folders (e.g., `config/`)
  - Settings files (e.g., `settings.py`, `config.json`)

### 2.4 Folder Structure
Avoid single-file projects. Use a clear and logical structure:

```
project/
├── src/
├── tests/
├── assets/
├── docs/          # Extra documentation (optional)
├── scripts/       # Helper or utility scripts (optional)
├── README.md
└── requirements.txt
```

> A clean structure is **required** to help judges navigate your project quickly.

---

## 3. Tests (Optional but Encouraged)

Tests are optional but **required if you want to be assessed on test coverage**.

- Place tests in a `tests/` directory
- Use filenames like `test_*.py` for Python
- Use `*.test.js` or `*.spec.js` for JavaScript/TypeScript
- Tests must be **real and meaningful** — not empty placeholders

---

## 4. Feature Accuracy & Honesty

Your documentation must reflect the **actual state** of your project.

- Every feature listed in the README must **exist and be usable** in the codebase
- Partially implemented or incomplete features must be **clearly labelled** as such

**Examples of accurate descriptions:**
- *"User registration is implemented with a basic form; email verification is not yet supported."*
- *"The dashboard page is present, but charts are static and not connected to live data."*

> ⚠️ Misrepresenting features or claiming work that has not been done **may lead to disqualification**.

---

## 5. Code Quality Standards

Follow basic open-source style and good engineering practices.

### 5.1 Structure & Organisation
- Use a logical folder structure (see Section 2.4)
- Avoid placing all logic in a single file (e.g., `main.py`, `index.js`)

### 5.2 Naming & Comments
- Use **descriptive names** for variables, functions, and files  
  ✅ `calculate_score`, `user_session`, `task_repository`  
  ❌ `temp1`, `x2`, `data1`
- Include **helpful comments and docstrings**:
  - Explain *why* something is done or any non-obvious logic
  - Add docstrings for important functions, classes, and modules

### 5.3 Security & Secrets
- **Do not hard-code** usernames, passwords, API keys, or tokens
- Use environment variables and reference them in code
- Provide `.env.example` instead of your real `.env` file

### 5.4 Clean-Up Before Submission
Before submitting, remove:
- Unused files, temporary scripts, and test data that are not needed
- Debugging code (e.g., stray `print` statements, `console.log` calls)
- Local log files and output artefacts (e.g., `debug.log`, `output.txt`)

> Readable, straightforward code is preferred over unnecessarily complex or "clever" solutions.

---

## 6. Highlighting Technical Depth (If Applicable)

If your project uses advanced technologies (e.g., AI, data pipelines), you should:

- Provide a short explanation in the README covering:
  - What technologies or techniques you used
  - Why you chose them
  - What problem they solve in your project
- Optionally include simple diagrams (inline in README or in a `docs/` folder):
  - System architecture diagrams (e.g., client → backend → database → external API)
  - Data flow diagrams (e.g., input → processing → output)

**Example explanation:**
> *"We use a fine-tuned transformer model to classify user support tickets by topic. This improves routing accuracy compared to keyword-based matching, which performed poorly in our tests."*

---

## 7. Open-Source Compliance & DCO Terms

These terms are **mandatory for participation**. By submitting, you confirm compliance with all of the following.

### 7.1 GitHub Accounts & Commit Sign-Off
- You may use your personal GitHub account
- All commits must be compatible with **Apache License 2.0** and the **Developer Certificate of Origin (DCO)**
- Follow hackathon instructions on commit sign-off (e.g., `git commit -s` with correct sign-off text)

### 7.2 Single Email Rule
Use a **single email address** for:
- All Git commits
- All hackathon-related communication
- The entire duration of the event

This ensures consistent identification of your contributions.

### 7.3 Identity & Representation
- Do **not** use fake identities, pseudonymous company personas, or shared corporate GitHub users
- All contributions are made in a **personal capacity**, not as official company work (unless explicitly authorised and disclosed)

### 7.4 Licensing, Policies & Conflicts of Interest
You must:
- Comply with open-source policies
- Follow external open-source standards including DCO requirements
- **Not** disclose or use confidential or proprietary company information in your project
- Use personal devices for hackathon work unless company policy explicitly allows otherwise

### 7.5 Repository Visibility
- During the hackathon, your GitHub repository must remain **private**
- After submission and review, repositories may be made public as required by event rules

### 7.6 No Plagiarism Policy
- All project work must be **original** to you and your team
- Do **not** copy other teams' work or reuse previous projects as new submissions
- Using open-source libraries and frameworks is allowed, but your project must add **original code, configuration, and integration work**
- You must respect the licences of all third-party dependencies

> ⚠️ Violation of these terms **may result in disqualification**.

---

## 8. Recommended Learning Resources (Optional)

The following courses are recommended to improve your understanding of open source. They are **not mandatory**.

### i. Open-Source Contribution in Finance (LFD137)
Topics include: risks of contributing in regulated environments, safe contribution practices, legal and compliance considerations.  
🔗 [training.linuxfoundation.org/training/open-source-contribution-in-finance-lfd137](https://training.linuxfoundation.org/training/open-source-contribution-in-finance-lfd137/)

### ii. Beginner's Guide to Open-Source Software Development (LFD102)
Topics include: how open-source projects are structured and managed, licensing and collaboration, Git/GitHub/CI-CD basics, community norms and best practices.  
🔗 [training.linuxfoundation.org/training/beginners-guide-open-source-softwaredevelopment](https://training.linuxfoundation.org/training/beginners-guide-open-source-softwaredevelopment/)

---

## 9. Final Requirements & Expectations

By submitting your project, you confirm that:

- [ ] It is reasonably easy to install and run using the instructions you provide
- [ ] Your README clearly describes what the project does and how to use it
- [ ] The folder structure and code organisation are clear and navigable
- [ ] The features you claim are **implemented and functional**
- [ ] You have followed the code quality, security, and compliance guidelines above

> Clear documentation, clean code and honest representation of your work are **essential requirements** for a valid and strong submission.

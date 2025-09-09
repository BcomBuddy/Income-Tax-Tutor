import type { Lesson, Question, CaseScenario } from '../types/index';

export const seedData = {
  lessons: [
    {
      topic: "Basic Concepts of Income Tax",
      objectives: [
        "Understand Previous Year and Assessment Year",
        "Learn about different types of persons",
        "Identify various heads of income"
      ],
      contentBlocks: [
        {
          type: "text",
          value: "Income Tax is a direct tax levied on the income earned by individuals, HUFs, companies, and other entities in a financial year."
        },
        {
          type: "bullets",
          value: [
            "Previous Year (PY): The year in which income is earned (April 1 to March 31)",
            "Assessment Year (AY): The year following PY when tax is assessed and paid",
            "Person: Individual, HUF, Company, Firm, AOP, BOI, Local Authority, Artificial Juridical Person"
          ]
        },
        {
          type: "text",
          value: "Five Heads of Income: 1) Salary, 2) House Property, 3) Business/Profession, 4) Capital Gains, 5) Other Sources"
        },
        {
          type: "example",
          value: "For FY 2023-24 (PY), the AY is 2024-25. Tax return is filed in AY 2024-25 for income earned in PY 2023-24."
        }
      ],
      keyTerms: ["Previous Year", "Assessment Year", "Person", "Heads of Income", "Taxable Income"],
      exitQuiz: [
        {
          type: "mcq",
          q: "What is the Previous Year for income earned from April 1, 2023 to March 31, 2024?",
          options: ["2022-23", "2023-24", "2024-25", "2025-26"],
          answer: "2023-24"
        },
        {
          type: "short", 
          q: "Name the five heads of income under the Income Tax Act.",
          answer: "Salary, House Property, Business/Profession, Capital Gains, Other Sources"
        }
      ]
    },
    {
      topic: "Deductions under Section 80C",
      objectives: [
        "Understand various investments eligible for 80C deduction",
        "Learn the maximum limit and conditions",
        "Calculate tax savings from 80C investments"
      ],
      contentBlocks: [
        {
          type: "text",
          value: "Section 80C provides deduction up to ₹1.5 lakh for certain investments and expenses, reducing taxable income."
        },
        {
          type: "bullets",
          value: [
            "ELSS (Equity Linked Savings Scheme): Mutual funds with 3-year lock-in",
            "PPF (Public Provident Fund): 15-year investment with tax-free returns",
            "EPF (Employee Provident Fund): Employer and employee contributions",
            "Life Insurance Premium: Premium paid for self, spouse, children",
            "NSC (National Savings Certificate): 5-year government scheme"
          ]
        },
        {
          type: "text",
          value: "Maximum deduction: ₹1.5 lakh per year. Tax saving = Investment amount × Tax rate"
        },
        {
          type: "example",
          value: "If you invest ₹1.5 lakh in ELSS and your tax rate is 30%, you save ₹45,000 in tax."
        }
      ],
      keyTerms: ["Section 80C", "ELSS", "PPF", "EPF", "Tax Saving", "Deduction"],
      exitQuiz: [
        {
          type: "mcq",
          q: "What is the maximum deduction available under Section 80C?",
          options: ["₹50,000", "₹1,00,000", "₹1,50,000", "₹2,00,000"],
          answer: "₹1,50,000"
        }
      ]
    }
  ] as Lesson[],

  questions: [
    {
      type: "mcq",
      q: "What is the maximum deduction available under Section 80C?",
      options: ["₹50,000", "₹1,00,000", "₹1,50,000", "₹2,00,000"],
      answer: "₹1,50,000",
      bloom: "Remember"
    },
    {
      type: "long",
      q: "Calculate the tax liability for an individual with gross salary ₹8,00,000, HRA ₹1,20,000 (actual rent paid ₹1,00,000), and 80C investments ₹1,50,000. Use the current tax slabs.",
      answer: "Calculate taxable income, apply tax rates, compute final tax liability",
      rubric: [
        "Correct HRA calculation",
        "Proper 80C deduction application", 
        "Accurate tax slab application",
        "Final tax computation",
        "Step-by-step working"
      ],
      bloom: "Apply"
    },
    {
      type: "short",
      q: "What is the difference between Previous Year and Assessment Year?",
      answer: "Previous Year: Year of earning income; Assessment Year: Year following PY when tax is assessed and paid"
    },
    {
      type: "mcq",
      q: "Which of the following is NOT eligible for 80C deduction?",
      options: ["ELSS", "PPF", "FD", "EPF"],
      answer: "FD",
      bloom: "Remember"
    }
  ] as Question[],

  cases: [
    {
      id: "tax_planning_scenario",
      title: "Tax Planning for Salaried Employee", 
      scenario: "A software engineer with annual salary ₹12,00,000 needs to optimize tax savings through proper investment planning and deductions.",
      nodes: [
        {
          prompt: "Choose optimal tax saving strategy:",
          options: [
            {
              label: "Maximum 80C Investment",
              impact: "Invest ₹1,50,000 in ELSS for 3-year lock-in; saves ₹45,000 tax at 30% rate.",
              score: 4
            },
            {
              label: "Health Insurance + 80C", 
              impact: "₹25,000 health insurance + ₹1,25,000 ELSS; saves ₹45,000 tax with health coverage.",
              score: 5
            },
            {
              label: "Home Loan + 80C",
              impact: "Home loan EMI + 80C investments; saves tax on both principal and interest.", 
              score: 4
            },
            {
              label: "Conservative FD Approach",
              impact: "Fixed deposits for safety; no tax benefits, only interest income.",
              score: 2
            }
          ]
        }
      ],
      explain: "Consider risk tolerance, liquidity needs, tax benefits, and long-term financial goals."
    }
  ] as CaseScenario[]
};
import type { Decision, Category } from '../types'

/**
 * Searches through decisions based on a query string.
 * All searchable properties have equal weight - if any match, the decision is included.
 * 
 * Searchable properties:
 * - title
 * - description
 * - options (name, pros, cons, bestWhen)
 * - questions
 */
export function searchDecisions(categories: Category[], query: string): Set<string> {
  const normalizedQuery = query.toLowerCase().trim()
  const matchingDecisionIds = new Set<string>()

  if (!normalizedQuery) {
    return matchingDecisionIds
  }

  for (const category of categories) {
    for (const decision of category.decisions) {
      if (decisionMatchesQuery(decision, normalizedQuery)) {
        matchingDecisionIds.add(decision.id)
      }
    }
  }

  return matchingDecisionIds
}

function decisionMatchesQuery(decision: Decision, query: string): boolean {
  // Search in title
  if (decision.title.toLowerCase().includes(query)) {
    return true
  }

  // Search in description
  if (decision.description.toLowerCase().includes(query)) {
    return true
  }

  // Search in questions
  for (const question of decision.questions) {
    if (question.toLowerCase().includes(query)) {
      return true
    }
  }

  // Search in options (name, pros, cons, bestWhen)
  for (const option of decision.options) {
    // Option name
    if (option.name.toLowerCase().includes(query)) {
      return true
    }

    // Option bestWhen
    if (option.bestWhen.toLowerCase().includes(query)) {
      return true
    }

    // Option pros
    for (const pro of option.pros) {
      if (pro.toLowerCase().includes(query)) {
        return true
      }
    }

    // Option cons
    for (const con of option.cons) {
      if (con.toLowerCase().includes(query)) {
        return true
      }
    }
  }

  return false
}

export function filterCategoriesBySearch(
  categories: Category[],
  matchingIds: Set<string>
): Category[] {
  if (matchingIds.size === 0) {
    return categories
  }

  return categories
    .map((category) => ({
      ...category,
      decisions: category.decisions.filter((d) => matchingIds.has(d.id)),
    }))
    .filter((category) => category.decisions.length > 0)
}


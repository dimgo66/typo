/*
 * FIX SUMMARY: Dash Disappearance Issue
 * 
 * PROBLEM:
 * Dashes at the beginning of paragraphs were disappearing due to overly aggressive
 * final cleanup patterns in the applySortedRules function.
 * 
 * ROOT CAUSE:
 * The patterns:
 *   /¶[ \t\u00A0\u2009]+/g
 *   /¶(\t*)[ \u00A0\u2009]+/g
 * 
 * Were matching and removing ¶ followed by any whitespace characters, including
 * em-dashes that immediately followed the paragraph marker.
 * 
 * For example, with input "¶— Привет", the pattern would match "¶— " and
 * replace it with just "¶", removing the em-dash.
 * 
 * SOLUTION:
 * Added positive lookaheads to ensure we only match whitespace that is followed
 * by more whitespace, not by actual content:
 *   /¶[ \t\u00A0\u2009]+(?=[ \t\u00A0\u2009])/g
 *   /¶(\t*)[ \u00A0\u2009]+(?=[ \t\u00A0\u2009])/g
 * 
 * This ensures that em-dashes and other content characters are preserved.
 * 
 * FILE MODIFIED:
 * lib/core/RussianTypographyRules.ts
 * 
 * LINES CHANGED:
 * - Line 461: Added lookahead to first cleanup pattern
 * - Line 464: Added lookahead to second cleanup pattern
 * 
 * VERIFICATION:
 * The fix has been tested with various input scenarios and correctly preserves
 * em-dashes at the beginning of paragraphs while still cleaning up excess whitespace.
 */
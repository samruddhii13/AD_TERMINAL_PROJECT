/**
 * v1.1.0 — added Returns & Exchanges category
 *
 * data/tree.js
 *
 * The decision tree data structure for the Contact Center KMT.
 *
 * STRUCTURE:
 *   Each node is either:
 *     1. A QUESTION node:  { question: string, options: { [label]: node } }
 *     2. A LEAF   node:    { resolution: string, escalate: boolean, steps: string[] }
 *
 * Nodes can be nested arbitrarily deep. The traversal engine (cli.js)
 * walks this tree interactively based on agent choices.
 *
 * CATEGORIES covered:
 *   - Billing
 *   - Technical Issues
 *   - Account Access
 *   - Order / Delivery
 */

export const tree = {
  question: "What is the nature of the customer's issue?",
  options: {

    // ─────────────────────────────────────────────────────────────────────────
    // BILLING
    // ─────────────────────────────────────────────────────────────────────────
    "💳  Billing": {
      question: "What is the billing issue?",
      options: {

        "Incorrect charge on account": {
          question: "Has the customer already been charged, or is this a pending charge?",
          options: {

            "Already charged (posted)": {
              question: "Is the charge from the current billing cycle or a previous cycle?",
              options: {

                "Current billing cycle": {
                  resolution: "Process a billing adjustment for the incorrect charge within the current cycle.",
                  escalate: false,
                  steps: [
                    "Pull up the customer's billing statement.",
                    "Identify the disputed line item.",
                    "Apply a one-time credit equal to the disputed amount.",
                    "Inform the customer the credit will reflect within 1–2 business days.",
                    "Send a billing correction email confirmation."
                  ]
                },

                "Previous billing cycle": {
                  resolution: "Escalate to the Billing Disputes team for a retroactive adjustment.",
                  escalate: true,
                  steps: [
                    "Collect the billing cycle date and the exact charge amount.",
                    "Create a Billing Dispute ticket (Category: Retroactive Adjustment).",
                    "Inform the customer the team will contact them within 3–5 business days.",
                    "Provide ticket reference number to the customer."
                  ]
                }
              }
            },

            "Pending charge (not yet posted)": {
              resolution: "Advise customer that pending charges can take 24–48 hours to post or drop off.",
              escalate: false,
              steps: [
                "Confirm the pending charge amount and merchant name.",
                "Explain that pending charges are temporary authorization holds.",
                "If the charge is from us, confirm whether a recent order or subscription renewal was made.",
                "Advise customer to call back in 48 hours if charge does not resolve."
              ]
            }
          }
        },

        "Subscription or plan pricing confusion": {
          question: "Is the customer questioning the price of their current plan or a new plan?",
          options: {

            "Current plan price changed": {
              resolution: "Explain the price change and offer a loyalty discount if eligible.",
              escalate: false,
              steps: [
                "Review the customer's subscription history.",
                "Confirm the price change date and reason (annual price update, promotional end, etc.).",
                "Check eligibility for a loyalty retention discount.",
                "If eligible, apply discount and inform the customer.",
                "If not eligible, explain upgrade/downgrade options."
              ]
            },

            "Quoted price doesn't match invoice": {
              resolution: "Escalate to Billing team with screenshot/reference of the quoted price.",
              escalate: true,
              steps: [
                "Ask the customer where they saw the quoted price (email, website, agent call).",
                "Document the quoted price and current invoice price.",
                "Raise a Price Discrepancy ticket.",
                "Advise customer a billing specialist will reach out within 2 business days."
              ]
            }
          }
        },

        "Refund request": {
          question: "What is the reason for the refund?",
          options: {

            "Product not received": {
              resolution: "Initiate a full refund and open a delivery investigation.",
              escalate: false,
              steps: [
                "Verify the order status in the system.",
                "Confirm shipping carrier tracking information.",
                "If delivery is marked complete but customer denies receipt, file a non-delivery claim.",
                "Issue a full refund within 5–7 business days.",
                "Send refund confirmation email."
              ]
            },

            "Product defective or not as described": {
              resolution: "Offer replacement or full refund per the Return & Refund Policy.",
              escalate: false,
              steps: [
                "Ask customer to describe the defect or discrepancy.",
                "Check if the item is within the 30-day return window.",
                "Offer: (a) replacement at no cost, or (b) full refund.",
                "If replacement: arrange return shipping label.",
                "If refund: process within 5–7 business days."
              ]
            },

            "Changed mind / no longer needed": {
              resolution: "Process refund only if within the 14-day return window; otherwise deny.",
              escalate: false,
              steps: [
                "Check order date against 14-day return window policy.",
                "If within window: issue store credit or original payment refund.",
                "If outside window: politely inform customer the return period has closed.",
                "Offer alternative: exchange or store credit as a goodwill gesture."
              ]
            }
          }
        }
      }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // TECHNICAL ISSUES
    // ─────────────────────────────────────────────────────────────────────────
    "🔧  Technical Issues": {
      question: "What type of technical issue is the customer experiencing?",
      options: {

        "App / Website not loading": {
          question: "Which platform is affected?",
          options: {

            "Mobile app (iOS / Android)": {
              resolution: "Guide customer through app reinstall and cache clear steps.",
              escalate: false,
              steps: [
                "Ask customer to force-close the app.",
                "Clear app cache: Settings → App → Clear Cache.",
                "Uninstall and reinstall the latest version from the App/Play Store.",
                "Check that the device OS is up to date.",
                "If issue persists after reinstall, collect device model + OS version and escalate to Tier-2 Tech."
              ]
            },

            "Web browser": {
              resolution: "Guide customer through browser troubleshooting steps.",
              escalate: false,
              steps: [
                "Ask customer to hard-refresh the page (Ctrl+Shift+R / Cmd+Shift+R).",
                "Clear browser cookies and cache.",
                "Try opening in an incognito / private window.",
                "Try a different browser (Chrome, Firefox, Edge).",
                "If all browsers fail, check our status page for known outages.",
                "If outage: provide ETA. If no outage: escalate with browser console error if available."
              ]
            }
          }
        },

        "Payment not processing": {
          question: "At which stage does the payment fail?",
          options: {

            "Card declined at checkout": {
              resolution: "Help customer verify card details and suggest alternate payment method.",
              escalate: false,
              steps: [
                "Ask customer to double-check card number, expiry, and CVV.",
                "Verify the billing address matches what the bank has on file.",
                "Suggest trying a different card or payment method (PayPal, UPI, net banking).",
                "If card is valid and still declined, advise customer to contact their bank.",
                "Offer to hold the cart for 24 hours while they resolve with their bank."
              ]
            },

            "Payment deducted but order not confirmed": {
              resolution: "Verify payment receipt and manually confirm the order.",
              escalate: true,
              steps: [
                "Ask customer for the transaction ID / UTR number from their bank statement.",
                "Check our payment gateway logs for the transaction.",
                "If payment is confirmed on gateway: manually trigger order confirmation.",
                "If payment is not found: advise customer that auto-reversal happens within 5–7 days.",
                "Raise a Payment Reconciliation ticket and share reference number."
              ]
            }
          }
        },

        "Feature not working as expected": {
          question: "Is this a known issue or something new the customer is reporting?",
          options: {

            "Known issue / ongoing outage": {
              resolution: "Inform customer of the known issue and provide the estimated resolution time.",
              escalate: false,
              steps: [
                "Check the internal known-issues board for the latest update.",
                "Inform the customer of the issue and expected fix timeline.",
                "Offer to notify them by email once the fix is deployed.",
                "Log the customer as an affected user for the incident ticket."
              ]
            },

            "New report — not previously seen": {
              resolution: "Collect reproduction steps and escalate to the Engineering / QA team.",
              escalate: true,
              steps: [
                "Ask customer to describe exactly what they clicked / did before the issue appeared.",
                "Note the exact error message or behavior observed.",
                "Ask for screenshots if possible (email to support@company.com).",
                "Raise a Bug Report ticket with all collected details.",
                "Inform customer the team will investigate within 1–2 business days."
              ]
            }
          }
        }
      }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // ACCOUNT ACCESS
    // ─────────────────────────────────────────────────────────────────────────
    "🔐  Account Access": {
      question: "What is the account access issue?",
      options: {

        "Forgot password": {
          question: "Can the customer access the email address linked to the account?",
          options: {

            "Yes, they can access their email": {
              resolution: "Send a password reset link to the registered email address.",
              escalate: false,
              steps: [
                "Confirm the registered email address with the customer.",
                "Trigger a password reset email from the admin portal.",
                "Ask customer to check spam/junk folder if email doesn't arrive in 2 minutes.",
                "Walk customer through the reset link flow if needed.",
                "Confirm successful password reset before closing the call."
              ]
            },

            "No, they cannot access their email": {
              question: "Can they verify identity via phone / government ID?",
              options: {

                "Yes — phone OTP or ID available": {
                  resolution: "Verify identity and update account email to a new address.",
                  escalate: false,
                  steps: [
                    "Verify customer identity: name, DOB, registered phone number.",
                    "Send OTP to registered mobile number.",
                    "Once OTP confirmed, update account email to new address provided.",
                    "Trigger password reset to new email.",
                    "Confirm account access is restored."
                  ]
                },

                "No — cannot verify identity": {
                  resolution: "Escalate to Account Security team. Cannot reset without identity verification.",
                  escalate: true,
                  steps: [
                    "Inform customer that identity verification is mandatory for account security.",
                    "Raise an Account Recovery ticket.",
                    "Instruct customer to submit a government ID via the secure upload portal (link: portal.company.com/verify).",
                    "The Account Security team will process within 2–3 business days."
                  ]
                }
              }
            }
          }
        },

        "Account locked / suspended": {
          question: "Why was the account locked?",
          options: {

            "Too many failed login attempts": {
              resolution: "Unlock account after verifying customer identity and reset login attempts.",
              escalate: false,
              steps: [
                "Confirm customer identity (name + registered email).",
                "Unlock the account from the admin console.",
                "Reset the failed login counter.",
                "Advise customer to use 'Forgot Password' if they are unsure of their credentials.",
                "Enable 2FA as a recommendation for account security."
              ]
            },

            "Suspended due to policy violation": {
              resolution: "Escalate to the Trust & Safety team — agent cannot unsuspend without review.",
              escalate: true,
              steps: [
                "Do NOT attempt to unsuspend the account at Tier-1.",
                "Review the suspension reason in the admin notes.",
                "Explain to the customer that the account was flagged for policy review.",
                "Raise a Trust & Safety review ticket.",
                "Inform the customer the review team will contact them within 3–5 business days."
              ]
            },

            "Account locked for billing reasons": {
              resolution: "Clear outstanding balance to unlock the account.",
              escalate: false,
              steps: [
                "Check the account for outstanding invoices.",
                "Inform the customer of the amount due.",
                "Process payment or set up a payment plan.",
                "Once payment is confirmed, unlock the account.",
                "Send reactivation confirmation email."
              ]
            }
          }
        },

        "Two-factor authentication (2FA) issues": {
          question: "What is the 2FA problem?",
          options: {

            "Not receiving OTP SMS": {
              resolution: "Verify phone number and resend OTP; suggest email 2FA as alternative.",
              escalate: false,
              steps: [
                "Confirm the phone number on file.",
                "Check if the customer's number has DND (Do-Not-Disturb) enabled — DND blocks promotional but NOT OTP SMS.",
                "Resend OTP from the admin portal.",
                "If still not received, switch 2FA delivery to email.",
                "Advise customer to whitelist the sender number."
              ]
            },

            "Lost access to authenticator app": {
              resolution: "Use backup codes or escalate to Account Security for 2FA reset.",
              escalate: true,
              steps: [
                "Ask if the customer has backup codes (provided at 2FA setup time).",
                "If yes: guide them to use a backup code to log in, then re-enroll 2FA.",
                "If no backup codes: raise an Account Security ticket for 2FA removal.",
                "Identity verification will be required before 2FA is reset.",
                "Resolution time: 1–2 business days."
              ]
            }
          }
        }
      }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // ORDER / DELIVERY
    // ─────────────────────────────────────────────────────────────────────────
    "📦  Order / Delivery": {
      question: "What is the order or delivery issue?",
      options: {

        "Order not yet shipped": {
          question: "How long has the order been in 'Processing' status?",
          options: {

            "Less than 48 hours": {
              resolution: "Inform customer that orders are typically dispatched within 48 hours.",
              escalate: false,
              steps: [
                "Confirm the order was placed successfully and payment was received.",
                "Advise the customer that the warehouse processes orders within 24–48 hours.",
                "Provide the expected dispatch date.",
                "Offer to send an email notification when the order is shipped."
              ]
            },

            "More than 48 hours": {
              resolution: "Escalate to Warehouse/Fulfillment team to investigate the delay.",
              escalate: true,
              steps: [
                "Pull up the order in the fulfillment system.",
                "Check for any hold flags (payment hold, stock issue, address mismatch).",
                "Raise a Fulfillment Delay ticket and assign to the warehouse team.",
                "Inform the customer of the delay and provide an updated dispatch estimate.",
                "Offer a discount code as a goodwill gesture if delay is significant (>72 hrs)."
              ]
            }
          }
        },

        "Order shipped but not delivered": {
          question: "What does the tracking status show?",
          options: {

            "In transit — on the way": {
              resolution: "Share tracking details and advise customer on expected delivery window.",
              escalate: false,
              steps: [
                "Pull up the tracking number and share the carrier's tracking link.",
                "Provide the estimated delivery date.",
                "Advise customer to check again after the estimated date.",
                "If estimated date has already passed, initiate a carrier investigation."
              ]
            },

            "Delivered — but customer says they did not receive it": {
              resolution: "File a non-delivery claim with the carrier and initiate a replacement/refund.",
              escalate: true,
              steps: [
                "Ask the customer to check all safe spots / with neighbors.",
                "Verify the delivery address on the order.",
                "File a non-delivery claim with the carrier.",
                "Offer: (a) reship the order, or (b) full refund.",
                "Inform the customer the investigation may take 3–5 business days."
              ]
            },

            "Returned to sender": {
              resolution: "Reship order or issue refund based on customer preference.",
              escalate: false,
              steps: [
                "Confirm why the shipment was returned (undeliverable, refused, address issue).",
                "Verify/update the customer's delivery address.",
                "Ask the customer: (a) reship to corrected address, or (b) full refund.",
                "Process the chosen option and notify customer of next steps."
              ]
            }
          }
        },

        "Wrong item received": {
          resolution: "Arrange return of wrong item and dispatch the correct item immediately.",
          escalate: false,
          steps: [
            "Confirm what item the customer received vs. what they ordered.",
            "Apologize for the fulfillment error.",
            "Arrange a free return pickup for the wrong item.",
            "Dispatch the correct item with priority/express shipping at no extra cost.",
            "Send tracking details for the replacement shipment."
          ]
        },

        "Order cancellation request": {
          question: "Has the order already been shipped?",
          options: {

            "Not yet shipped — can cancel": {
              resolution: "Cancel the order and issue a full refund.",
              escalate: false,
              steps: [
                "Cancel the order in the order management system.",
                "Confirm cancellation to the customer.",
                "Issue a full refund to the original payment method.",
                "Inform customer that refund will reflect in 3–5 business days.",
                "Send cancellation confirmation email."
              ]
            },

            "Already shipped — cannot cancel": {
              resolution: "Advise customer to refuse delivery or initiate a return after receipt.",
              escalate: false,
              steps: [
                "Inform the customer the order is already shipped and cannot be cancelled mid-transit.",
                "Advise the customer to refuse delivery at the door — carrier will return to sender.",
                "Alternatively, accept delivery and initiate a return request within the return window.",
                "Once returned, a full refund will be issued within 5–7 business days."
              ]
            }
          }
        }
      }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // RETURNS & EXCHANGES
    // ─────────────────────────────────────────────────────────────────────────
    "🔄  Returns & Exchanges": {
      question: "What does the customer need help with?",
      options: {

        "Initiate a return": {
          question: "What is the reason for the return?",
          options: {

            "Item is defective or damaged": {
              resolution: "Approve return, arrange free pickup, and issue full refund or replacement.",
              escalate: false,
              steps: [
                "Verify the order is within the 30-day return window.",
                "Ask the customer to describe or photograph the defect.",
                "Generate a free return shipping label (email to customer).",
                "Once item is received at warehouse, process full refund or dispatch replacement.",
                "Notify customer of resolution via email."
              ]
            },

            "Changed mind / no longer needed": {
              resolution: "Process return only if within 14-day window; customer covers return shipping.",
              escalate: false,
              steps: [
                "Confirm order date — must be within 14 days for a change-of-mind return.",
                "Inform customer they are responsible for return shipping costs.",
                "Provide the warehouse return address.",
                "Once item received in original condition, issue store credit or refund.",
                "Inform customer that refund takes 5–7 business days."
              ]
            }
          }
        },

        "Exchange for a different item": {
          question: "Is the item being exchanged due to a defect or a preference change?",
          options: {

            "Defective — want same item replaced": {
              resolution: "Arrange free exchange: collect faulty item and dispatch a new unit.",
              escalate: false,
              steps: [
                "Confirm the defect and verify the item is within the 30-day window.",
                "Schedule a free return pickup.",
                "Dispatch a replacement unit with priority shipping.",
                "Send tracking details to the customer.",
                "Follow up after delivery to confirm satisfaction."
              ]
            },

            "Preference change — want a different size, colour, or model": {
              resolution: "Process an exchange if stock is available; otherwise offer store credit.",
              escalate: false,
              steps: [
                "Check if the desired variant is in stock.",
                "If in stock: create a new order for the desired item and process return of the original.",
                "Customer covers return shipping for preference-based exchanges.",
                "If out of stock: offer full store credit equal to the item value.",
                "Confirm the exchange or credit with the customer via email."
              ]
            }
          }
        },

        "Return status / refund not received": {
          question: "Has the customer already shipped the return back?",
          options: {

            "Yes — return shipped, refund not yet received": {
              resolution: "Track the return shipment and confirm warehouse receipt; trigger refund manually if needed.",
              escalate: false,
              steps: [
                "Ask for the return tracking number.",
                "Check the carrier's tracking to confirm delivery to the warehouse.",
                "If delivered: check the refund processing status in the system.",
                "If stuck in processing: manually trigger the refund and log the action.",
                "Inform customer refund will reflect in 5–7 business days."
              ]
            },

            "No — customer hasn't shipped yet, lost the return label": {
              resolution: "Resend the return shipping label to the customer's registered email.",
              escalate: false,
              steps: [
                "Verify the original return request is still active.",
                "Regenerate and email a new return shipping label.",
                "Remind customer to pack the item securely.",
                "Advise customer to ship within 5 days to stay within the return window."
              ]
            }
          }
        }

      }
    }

  }
};

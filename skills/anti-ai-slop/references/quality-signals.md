# AI-Slop Quality Signals

Last reviewed: 2026-11-24.

This is an evidence-informed editing checklist, not a universal definition or an AI detector. “Slop” is contested and depends on audience, genre, and context. Use signals below as prompts to inspect impact—not as a checklist that every artifact must mechanically satisfy.

## High-confidence review targets

- **Low information value:** sentences take space without adding evidence, explanation, decision value, or useful emotional effect.
- **Repetition and template dependence:** the same idea is restated; headings or transitions announce an obvious structure without helping readers navigate; content feels interchangeable across audiences or tasks.
- **Vagueness and poor fit:** advice, claims, examples, or tone do not fit the specific question, reader, relationship, or medium.
- **Unsupported or misleading substance:** invented facts, sources, examples, visual details, or confidence; incoherent reasoning; material uncertainty hidden from the audience.
- **Unnecessary complexity:** inflated vocabulary, jargon, long sentences, excessive sections, decorative media, or code abstractions that make the artifact harder to use or review without adding value.
- **Externalized review cost:** oversized or unexplained code changes, boilerplate, unverified generated tests/docs, and output the recipient must substantially rework before it is usable.

## Apply by artifact

- **Writing and documentation:** check whether each section answers the reader’s actual question, claims have traceable support, examples are concrete and relevant, and the piece can be shortened without losing meaning.
- **Code and pull requests:** check scope against the request, understandability, duplication, dead or speculative behavior, tests that assert real contracts, and whether the author could explain the change. Do not infer poor quality from line count alone.
- **Visual or audio/video media:** check whether the asset communicates the intended point, fits its context, contains visible contradictions or fabricated details, and adds value rather than merely occupying attention. Limit findings to what can be inspected.

## Weak signals: never use alone

Em dashes, polished grammar, balanced phrasing, lists of three, stock transitions, neat headings, or a formal tone can appear in good human work. A 2025 study of readers assessing refusal emails found formulaic, repetitive, generic, jargon-heavy language and poor relationship/context fit among criticisms, but its findings are genre-specific. A 2023 experiment found people relied on unreliable heuristics when trying to identify AI-written text. Prefer concrete usefulness and correctness over attempts to sound “human.”

## Research notes

- Shaib et al., [Measuring AI “Slop” in Text](https://arxiv.org/abs/2509.19163) (2025): proposes a multidimensional, expert-informed taxonomy including factuality, relevance, repetition, templatedness, verbosity, coherence, vagueness, and utility; notes that binary slop judgments are subjective and annotators do not weight all dimensions alike.
- Li and Banks, [Defective, Amplified, Contested: Folk Conceptualizations of AI Slop](https://arxiv.org/abs/2610.14231) (2026): qualitative analysis of Reddit discussions highlights perceived defects, repeated content, misinformation, platform saturation, and disagreement over what deserves the label.
- Columbia SIPA Institute of Global Politics, [AI Slop and the Information Ecosystem](https://igp.sipa.columbia.edu/sites/igp/files/2026-06/AI%20Slop%20and%20the%20Information%20Ecosystem_IGP_Report.pdf) (2026): describes cross-media concerns such as high-volume, repetitive, low-effort content, while noting that “slop” has no consensus definition and can be culturally contested.
- Baltes, Cheong, and Treude, [“An Endless Stream of AI Slop”: How Developers Discuss the Burden of AI-Assisted Software Development](https://assets.empirical-software.engineering/pdf/ieeesw26-ai-slop.pdf) (2026): analysis of 1,154 Reddit and Hacker News posts groups developer concerns around review friction, quality degradation, trust, and accountability. These are reported community concerns, not universal properties of generated code.
- Wilson and Rose, [A Genre, Scoring, and Authorship Analysis of AI-Generated and Human-Written Refusal Emails](https://journals.sagepub.com/doi/full/10.1177/23294906251322890) (2025): readers described AI refusal emails as generic, verbose, repetitive, and poorly adjusted to writer-reader relationships; apply cautiously outside this genre.
- Jakesch et al., [Human heuristics for AI-generated language are flawed](https://pmc.ncbi.nlm.nih.gov/articles/PMC10089155/) (2023): in experiments on short self-presentations, participants were near chance at authorship judgments and several intuitive cues were misleading. Do not use this skill to identify authorship.
- Wiggers, [The AI writing tics that hurt engagement: A study](https://searchengineland.com/ai-writing-tics-engagement-study-470051) (2025): its content-marketing dataset found most alleged tics weakly related to engagement; em dashes were not a negative signal. Treat this as a domain-specific observational study, not a universal law.

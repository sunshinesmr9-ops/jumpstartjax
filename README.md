# WorkJax

WorkJax is a prototype workforce ecosystem platform connecting students and young adults in Northeast Florida with experiential learning opportunities, employers, local experiences, and peers.

## Current Status

WorkJax is currently a static prototype built with HTML, CSS, and JavaScript and deployed through Vercel. The current content is stored in `data.js`.

The long-term goal is for an ecosystem partner to operate WorkJax as a public platform with automatically updated opportunities and events, shared student profiles, and clear content-governance processes.

## Live Prototype

- Production prototype: https://workjax.vercel.app/

## Repository Structure

```text
workjax/
├── index.html
├── styles.css
├── data.js
├── app.js
├── README.md
└── docs/
```

## Documentation

The [`docs/`](docs/README.md) directory is the single source of truth for:

- Product purpose and scope
- Current and target architecture
- Feature behavior
- Data models and relationships
- Content ingestion and update processes
- Privacy and safety requirements
- Governance and ownership decisions
- Implementation roadmap

## Documentation Rule

Any pull request that changes a feature, data field, integration, or operating process should update the corresponding Markdown documentation in the same pull request.

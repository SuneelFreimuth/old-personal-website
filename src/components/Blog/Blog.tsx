import React from "react";
import styles from "./Blog.module.css";
import ReactMarkdown from "react-markdown";

const md = `
\`\`\`python
# Fenced off code
print("this is a thing")
\`\`\`
`;

export default function Blog() {
	return (
		<div>
			Dog with a blog haha
			<ReactMarkdown source={md} />
		</div>
	);
}

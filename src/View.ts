// TeamCommentsView.ts

import { ItemView, WorkspaceLeaf } from 'obsidian';
import Vue from 'vue'; // Import Vue.js

export class TeamCommentsView extends ItemView {
  private container: HTMLDivElement;
  private vueInstance: Vue; // Vue instance for reactive updates
  private backendBaseUrl: string = 'http://your-backend-api'; // Replace with your backend API URL

  private selectedTextId: string | null = null;

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    this.init();
  }

  getViewType(): string {
    return 'team-comments-view';
  }

  getDisplayText(): string {
    return 'Team Comments'; // Displayed in the UI
  }

  async onOpen(): Promise<void> {
    // Get the currently selected text
    const selectedText = this.getSelectedText();
    if (!selectedText) return;

    // Assign a unique identifier to the selected text (e.g., using a hash function)
    this.selectedTextId = this.generateUniqueId(selectedText);

    // Load comments from the backend based on the selected text
    await this.loadCommentsFromBackend();

    // Set up the HTML template
    this.container.innerHTML = `
      <input v-model="newComment" type="text" placeholder="Add a comment...">
      <button @click="submitComment">Submit</button>
      <div class="comments-container">
        <div v-for="comment in comments" :key="comment.id">{{ comment.text }}</div>
      </div>
    `;

    // Create a Vue instance with reactive data
    this.vueInstance = new Vue({
      el: this.container,
      data: {
        newComment: '',
        comments: [],
      },
      methods: {
        submitComment: () => this.submitComment(),
      },
    });
  }

  private async loadCommentsFromBackend() {
    try {
      // Fetch comments from the backend based on the selected text ID
      const response = await fetch(`${this.backendBaseUrl}/comments?textId=${encodeURIComponent(this.selectedTextId)}`);
      if (response.ok) {
        const comments = await response.json();
        // Update comments in the Vue instance to trigger reactivity
        this.vueInstance.comments = comments;
      } else {
        console.error('Failed to fetch comments from the backend.');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  }

  private async submitComment() {
    const commentText = this.vueInstance.newComment.trim();
    if (commentText !== '') {
      try {
        // Submit a new comment to the backend, including the selected text ID
        const response = await fetch(`${this.backendBaseUrl}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: commentText, textId: this.selectedTextId }),
        });

        if (response.ok) {
          // Fetch updated comments from the backend after submitting a new comment
          await this.loadCommentsFromBackend();
          // Clear the input after submitting
          this.vueInstance.newComment = '';
        } else {
          console.error('Failed to submit comment to the backend.');
        }
      } catch (error) {
        console.error('Error submitting comment:', error);
      }
    }
  }

  // Helper method to get the currently selected text
  private getSelectedText(): string | null {
    const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
    return editor?.getSelection();
  }

  // Helper method to generate a unique identifier for the selected text (replace with your own logic)
  private generateUniqueId(text: string): string {
    // Replace this with your unique ID generation logic (e.g., using a hash function)
    return text.toLowerCase().replace(/\s+/g, '-'); // Example: Convert to lowercase and replace spaces with dashes
  }
}

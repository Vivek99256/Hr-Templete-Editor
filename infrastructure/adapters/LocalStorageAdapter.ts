import { Template } from "../../core/models/Template";
import { TemplateAdapter } from "./TemplateAdapter";

const STORAGE_KEY = "hr_templates";

export class LocalStorageAdapter implements TemplateAdapter {
    private getTemplates(): Template[] {
        if (typeof window === "undefined") return [];
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    private setTemplates(templates: Template[]): void {
        if (typeof window === "undefined") return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    }

    async save(template: Template): Promise<void> {
        const templates = this.getTemplates();
        const index = templates.findIndex((t) => t.id === template.id);
        if (index >= 0) {
            templates[index] = template;
        } else {
            templates.push(template);
        }
        this.setTemplates(templates);
    }

    async getById(id: string): Promise<Template | null> {
        const templates = this.getTemplates();
        return templates.find((t) => t.id === id) || null;
    }

    async getAll(): Promise<Template[]> {
        return this.getTemplates();
    }

    async delete(id: string): Promise<void> {
        const templates = this.getTemplates();
        this.setTemplates(templates.filter((t) => t.id !== id));
    }
}

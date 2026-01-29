'use client';

import { useState, useEffect } from 'react';

interface SavedTicket {
    id: string;
    number: string;
    date: string;
    province?: string;
    winnings?: Array<{
        province: string;
        prize: string;
        prizeAmount: number;
    }>;
    createdAt: number;
}

const STORAGE_KEY = 'lottery_tickets';
const MAX_TICKETS = 100;

export function useTicketStorage() {
    const [tickets, setTickets] = useState<SavedTicket[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load tickets from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setTickets(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Failed to load tickets:', e);
        }
        setIsLoaded(true);
    }, []);

    // Save tickets to localStorage
    const saveToStorage = (newTickets: SavedTicket[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newTickets));
        } catch (e) {
            console.error('Failed to save tickets:', e);
        }
    };

    const addTicket = (ticket: Omit<SavedTicket, 'id' | 'createdAt'>) => {
        const newTicket: SavedTicket = {
            ...ticket,
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            createdAt: Date.now(),
        };

        setTickets((prev) => {
            // Check for duplicate
            const exists = prev.find(t => t.number === ticket.number && t.date === ticket.date);
            if (exists) {
                // Update existing
                const updated = prev.map(t =>
                    t.number === ticket.number && t.date === ticket.date
                        ? { ...t, ...ticket }
                        : t
                );
                saveToStorage(updated);
                return updated;
            }

            // Add new, limit to MAX_TICKETS
            const updated = [newTicket, ...prev].slice(0, MAX_TICKETS);
            saveToStorage(updated);
            return updated;
        });

        return newTicket;
    };

    const removeTicket = (id: string) => {
        setTickets((prev) => {
            const updated = prev.filter(t => t.id !== id);
            saveToStorage(updated);
            return updated;
        });
    };

    const clearAllTickets = () => {
        setTickets([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    return {
        tickets,
        isLoaded,
        addTicket,
        removeTicket,
        clearAllTickets,
    };
}

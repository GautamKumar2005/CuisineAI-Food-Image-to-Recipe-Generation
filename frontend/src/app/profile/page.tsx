"use client";

import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { User, Mail, Calendar, LogOut, ArrowLeft, Shield, Utensils, Award, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ProfilePage() {
    const { data: session } = useSession();
    const [stats, setStats] = useState({ totalRecipes: 0 });

    useEffect(() => {
        if (session) {
            axios.get("/api/history")
                .then(res => setStats({ totalRecipes: res.data.length }))
                .catch(() => {});
        }
    }, [session]);

    if (!session) {
        return (
            <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 font-sans">
                <div className="max-w-md w-full bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-8 h-8 text-slate-300" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Access Denied</h1>
                    <p className="text-slate-500 font-bold text-sm mb-8 px-4">You must be logged in to view your culinary profile.</p>
                    <Link href="/login" className="block w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all">
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafafa] font-sans pb-20">
            {/* Nav */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-orange-500 font-black text-[10px] uppercase tracking-widest transition-all">
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </Link>
                    <span className="text-sm font-black text-slate-900 tracking-tighter italic">Cuisine<span className="text-orange-500">AI</span> Profile</span>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 pt-28">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative"
                >
                    {/* Header Decoration */}
                    <div className="h-32 bg-gradient-to-r from-orange-400 to-orange-600 relative overflow-hidden">
                        <Sparkles className="absolute -top-4 -right-4 text-white/20 w-32 h-32 animate-pulse" />
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                    </div>

                    <div className="px-8 md:px-12 pb-12 relative">
                        {/* Profile Picture Area */}
                        <div className="relative -top-12 flex flex-col md:flex-row md:items-end gap-6">
                            <div className="w-32 h-32 rounded-[2.5rem] bg-white border-[6px] border-white shadow-xl flex items-center justify-center overflow-hidden">
                                <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white text-4xl font-black">
                                    {session.user?.name?.charAt(0).toUpperCase() || <User size={48} />}
                                </div>
                            </div>
                            <div className="mb-4">
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">{session.user?.name || "Member"}</h2>
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                                    <Shield className="w-3 h-3 text-orange-500" />
                                    Verified Culinary Expert
                                </p>
                            </div>
                            <div className="md:ml-auto mb-4">
                                <button 
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-all shadow-lg active:scale-95"
                                >
                                    <LogOut className="w-4 h-4" /> Sign Out
                                </button>
                            </div>
                        </div>

                        {/* Content Grid */}
                        <div className="grid md:grid-cols-2 gap-8 mt-4">
                            <div className="space-y-6">
                                <section>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-2">Account Details</h3>
                                    <div className="space-y-3">
                                        <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500">
                                                <Mail size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-black text-slate-400 leading-tight">Email Address</p>
                                                <p className="text-sm font-bold text-slate-700">{session.user?.email}</p>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-500">
                                                <Calendar size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-black text-slate-400 leading-tight">Member Status</p>
                                                <p className="text-sm font-bold text-slate-700">Active Enthusiast</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-2">Achievements</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="bg-orange-50 text-orange-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-orange-100">
                                            <Award size={14} /> Early Adopter
                                        </span>
                                        <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-blue-100">
                                            <Utensils size={14} /> AI Chef
                                        </span>
                                    </div>
                                </section>
                            </div>

                            <div className="space-y-6">
                                <section className="h-full">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-2">Culinary Stats</h3>
                                    <div className="bg-slate-950 p-8 rounded-[2rem] text-white flex flex-col justify-center items-center h-[calc(100%-2rem)] shadow-xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
                                        <div className="animate-bounce mb-4 text-orange-500">
                                            <Utensils size={40} />
                                        </div>
                                        <div className="text-5xl font-black mb-1">{stats.totalRecipes}</div>
                                        <div className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500">Recipes Synthesized</div>
                                        <Link 
                                            href="/history" 
                                            className="mt-8 text-[10px] font-black text-orange-500 hover:text-white transition-colors uppercase tracking-[0.2em] border-b border-orange-500/30 hover:border-white"
                                        >
                                            View Lab History →
                                        </Link>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="mt-12 text-center">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em]">CuisineAI Security Protocol • v0.1.0</p>
                </div>
            </main>
        </div>
    );
}

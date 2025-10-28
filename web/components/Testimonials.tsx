"use client";

import React from 'react';
import { Marquee } from './ui/marquee';
import { Tweet } from 'react-tweet';

const tweetsIDs = [
    "1980298310943731858",
    "1980296853490168285",
    "1980277914814820684",
    "1980361638516781243",
    "1980315329348923719",
    "1980250414651146350",
    "1980209740526612888",
    "1980327473989722282",
    "1980369093271384433",
    "1980271112018948590",
    "1980282297610846634",
    "1980281379779973407",
    "1980587093698232445",
    "1980332222453530960",
    "1980321125944160484",
    "1980280869047922691",
    "1980278216209404135",
];

const Testimonials = () => {
    const firstRow = tweetsIDs.slice(0, Math.ceil(tweetsIDs.length / 2));
    const secondRow = tweetsIDs.slice(Math.ceil(tweetsIDs.length / 2));

    return (
        <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black dark:text-white mb-4">
                        Testimonials
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        See what developers are saying about Quotick
                    </p>
                </div>
                <div className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-3xl bg-white dark:bg-neutral-950 h-[800px] lg:h-[900px]" data-theme="light">
                    <Marquee pauseOnHover className="[--duration:40s]">
                        {firstRow.map((tweetId) => (
                            <div key={tweetId} className="shrink-0 w-[350px]">
                                <Tweet id={tweetId} />
                            </div>
                        ))}
                    </Marquee>
                    <Marquee reverse pauseOnHover className="[--duration:40s]">
                        {secondRow.map((tweetId) => (
                            <div key={tweetId} className="shrink-0 w-[350px]">
                                <Tweet id={tweetId} />
                            </div>
                        ))}
                    </Marquee>
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-linear-to-r from-background"></div>
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-linear-to-l from-background"></div>
                </div>
            </div>
        </div >
    );
};

export default Testimonials;


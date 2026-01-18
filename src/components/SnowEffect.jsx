import React from 'react';
import './SnowEffect.css';

const SnowEffect = () => {
    // Create 100 snowflakes for heavy snowfall
    const snowflakes = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 4 + 3}s`,
        animationDelay: `${Math.random() * 5}s`,
        fontSize: `${Math.random() * 8 + 4}px`, // Reduced size
        opacity: Math.random() * 0.5 + 0.5,
        windOffset: `${Math.random() * 100 - 50}px`
    }));

    return (
        <>
            {/* Winter Landscape Background - Shadows Only */}
            <div className="winter-landscape">
                {/* Mountains */}
                <div className="mountain mountain-back"></div>
                <div className="mountain mountain-mid"></div>
                <div className="mountain mountain-front"></div>

                {/* Single House Shadow (right side, grounded) */}
                <div className="house-shadow house-shadow-2">
                    <div className="chimney-shadow">
                        {/* Higher density smoke */}
                        {Array.from({ length: 15 }).map((_, i) => (
                            <div key={i} className="smoke-puff"></div>
                        ))}
                    </div>
                    <div className="window-light"></div>
                    {/* More snow piles around the base */}
                    <div className="snow-pile pile-1"></div>
                    <div className="snow-pile pile-2"></div>
                    <div className="snow-pile pile-3"></div>
                    <div className="snow-pile pile-4"></div>
                    <div className="snow-pile pile-5"></div>
                    <div className="snow-pile pile-6"></div>
                    <div className="snow-pile pile-7"></div>
                    <div className="snow-pile pile-8"></div>
                </div>

                {/* Santa's Sleigh Shadow - Flying */}
                <div className="sleigh-shadow"></div>
            </div>

            {/* Snow Container */}
            <div className="snow-container">
                {snowflakes.map((flake) => (
                    <div
                        key={flake.id}
                        className="snowflake"
                        style={{
                            left: flake.left,
                            animationDuration: flake.animationDuration,
                            animationDelay: flake.animationDelay,
                            fontSize: flake.fontSize,
                            opacity: flake.opacity,
                            '--wind-offset': flake.windOffset
                        }}
                    >
                        ❄
                    </div>
                ))}
            </div>
        </>
    );
};

const Snowman = ({ position = 'left' }) => {
    return (
        <div className={`snowman-container snowman-${position}`}>
            {/* Ground Shadow */}
            <div className="snowman-shadow"></div>

            {/* Snow Piles around Snowman Base */}
            <div className="snowman-snow-base">
                <div className="snow-pile pile-1"></div>
                <div className="snow-pile pile-2"></div>
                <div className="snow-pile pile-3"></div>
                <div className="snow-pile pile-4"></div>
                <div className="snow-pile pile-5"></div>
                <div className="snow-pile pile-6"></div>
                <div className="snow-pile pile-7"></div>
                <div className="snow-pile pile-8"></div>

            </div>

            <div className="snowman-inner">
                {/* Scarf */}
                <div className="snowman-scarf">
                    <div className="scarf-wrap"></div>
                    <div className="scarf-tail"></div>
                    <div className="scarf-fringe"></div>
                </div>

                {/* Hat */}
                <div className="snowman-hat">
                    <div className="hat-top">
                        <div className="hat-pompom"></div>
                        <div className="hat-band"></div>
                    </div>
                    <div className="hat-brim"></div>
                </div>

                {/* Head */}
                <div className="snowman-head">
                    <div className="snowman-eye left-eye">
                        <div className="eye-sparkle"></div>
                    </div>
                    <div className="snowman-eye right-eye">
                        <div className="eye-sparkle"></div>
                    </div>
                    <div className="snowman-nose-3d"></div>
                    <div className="snowman-blush left-blush"></div>
                    <div className="snowman-blush right-blush"></div>
                    <div className="snowman-smile">
                        <div className="smile-dot"></div>
                        <div className="smile-dot"></div>
                        <div className="smile-dot"></div>
                        <div className="smile-dot"></div>
                        <div className="smile-dot"></div>
                    </div>
                </div>

                {/* Body */}
                <div className="snowman-body">
                    <div className="snowman-button button-1"></div>
                    <div className="snowman-button button-2"></div>
                    <div className="snowman-button button-3"></div>
                </div>

                {/* Base */}
                <div className="snowman-base"></div>

                {/* Arms */}
                <div className="snowman-arm left-arm">
                    <div className="arm-branch branch-1"></div>
                    <div className="arm-branch branch-2"></div>
                </div>
                <div className="snowman-arm right-arm">
                    <div className="arm-branch branch-1"></div>
                    <div className="arm-branch branch-2"></div>
                </div>
            </div>
        </div>
    );
};

export { SnowEffect, Snowman };

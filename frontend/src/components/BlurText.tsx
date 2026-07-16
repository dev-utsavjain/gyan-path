import React from 'react';
import { motion } from 'motion/react';

interface BlurTextProps {
  text: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom';
  as?: React.ElementType;
  onAnimationComplete?: () => void;
}

export default function BlurText({
  text,
  delay = 200,
  className = '',
  animateBy = 'words',
  direction = 'top',
  as: Component = 'div',
  onAnimationComplete,
}: BlurTextProps) {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');
  const initialY = direction === 'top' ? -20 : 20;

  return (
    <Component className={className}>
      {elements.map((element, index) => (
        <motion.span
          key={index}
          initial={{ filter: 'blur(10px)', opacity: 0, y: initialY }}
          whileInView={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{
            duration: 0.4,
            delay: delay / 1000 + index * 0.08,
            ease: 'easeOut',
          }}
          onAnimationComplete={
            index === elements.length - 1 ? onAnimationComplete : undefined
          }
          className="inline-block whitespace-pre-wrap"
        >
          {element}
          {animateBy === 'words' && index < elements.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </Component>
  );
}

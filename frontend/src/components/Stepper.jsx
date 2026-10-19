import { Check } from 'lucide-react';

export function Stepper({ step }) {
  const steps = [
    { num: '01', title: 'Describe', marathi: 'तक्रार' },
    { num: '02', title: 'Analyze', marathi: 'विश्लेषण' },
    { num: '03', title: 'Review', marathi: 'पुनरावलोकन' },
  ];

  return (
    <div className="stepper-container" aria-label="Complaint progress">
      <div className="stepper">
        {steps.map((item, index) => {
          const isCompleted = step > index;
          const isActive = step === index;
          return (
            <div
              className={`step ${isActive ? 'current' : ''} ${isCompleted ? 'completed' : ''}`}
              key={item.num}
            >
              <div className="step-circle" aria-current={isActive ? 'step' : undefined}>
                {isCompleted ? <Check size={14} strokeWidth={3} /> : item.num}
              </div>
              <div className="step-content">
                <span className="step-label">{item.title}</span>
              </div>
              {index < steps.length - 1 && <div className={`step-connector ${step > index ? 'connector-filled' : ''}`} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

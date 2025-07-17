import { ChevronsUpDown, Wrench } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { Button } from "../ui/button";
import PSelect from "../p-select";
import { useTextTranslate } from "@/contexts/text-translate-context";
import { ModelType } from "deepl-node";

const AdvancedSettings = () => {
    const {transRequest, setTransRequest} = useTextTranslate()
  return (
    <Collapsible>
      <div className="flex items-center gap-4 px-4">
        <h4 className="text-sm font-semibold flex items-center">
          {' '}
          <Wrench className="w-4 mr-1" />
          고급 설정
        </h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <ChevronsUpDown />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <PSelect
          value={transRequest.model || ''}
          onChange={(value) => {
            setTransRequest({ ...transRequest, model: value as ModelType });
          }}
          options={[
            { label: 'latency_optimized', value: 'latency_optimized' },
            { label: 'quality_optimized', value: 'quality_optimized' },
            {
              label: 'prefer_quality_optimized',
              value: 'prefer_quality_optimized',
            },
          ]}
          placeholder="모델 선택"
        />
      </CollapsibleContent>
    </Collapsible>
  );
};

export default AdvancedSettings;

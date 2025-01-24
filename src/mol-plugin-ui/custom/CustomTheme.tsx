// 自定义主题疏水性标识主题
import { ColorTheme } from '../../mol-theme/color';
import { ThemeDataContext } from '../../mol-theme/theme';
import { Color } from '../../mol-util/color';
import { Location } from '../../mol-model/location';
import { StructureElement } from '../../mol-model/structure';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { StructureProperties } from '../../mol-model/structure/structure/properties';

// 1. 定义参数（如果需要的话）
const CustomParams = {
    // name: PD.Value<string>('')
    // 可以添加自定义参数
    hydrophobicityList: PD.Value<any[]>([])
};

// 2. 实现颜色主题函数
function CustomResidueColorTheme(ctx: ThemeDataContext, props: PD.Values<typeof CustomParams>): ColorTheme<typeof CustomParams> {
    return {
        factory: CustomResidueColorTheme,
        granularity: 'group',
        color: (location: Location) => {
            if (!StructureElement.Location.is(location)) {
                return Color(0xCCCCCC);
            }

            const residueId = StructureProperties.residue.auth_seq_id(location);
            const chainId = StructureProperties.chain.auth_asym_id(location);
            const compId = StructureProperties.residue.microheterogeneityCompIds(location)[0];
            // const fileName = StructureProperties.unit.model_label(location);
            // console.log(location);
            // console.log(residueId);
            console.log(props);
            console.log(chainId);
            console.log(compId);
            // console.log(fileName);
            // 根据条件返回颜色
            if (chainId === 'A' && residueId >= 60 && residueId <= 205) {
                return Color(0xFF0000);
            }
            return Color(0xCCCCCC);
        },
        props: props,
        description: 'Colors specific residues in red',
        contextHash: 0,
    };
}

// 3. 正确定义主题提供者
export const CustomResidueColorThemeProvider: ColorTheme.Provider<typeof CustomParams, 'custom-residue'> = {
    name: 'custom-residue',
    label: 'Custom Residue Color',
    category: ColorTheme.Category.Misc,
    factory: CustomResidueColorTheme,
    getParams: () => CustomParams,
    defaultValues: PD.getDefaultValues(CustomParams),
    isApplicable: (ctx: ThemeDataContext) => !!ctx.structure
};
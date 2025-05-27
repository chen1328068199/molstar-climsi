/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import { Color } from '../../mol-util/color';
import { StructureElement, Unit, Bond, ElementIndex } from '../../mol-model/structure';
import { Location } from '../../mol-model/location';
import type { ColorTheme, LocationColor } from '../color';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { ThemeDataContext } from '../theme';
import { ResidueHydrophobicity } from '../../mol-model/structure/model/types';
import { ColorThemeCategory } from './categories';

const Description = 'Assigns a color to every amino acid according to the "Experimentally determined hydrophobicity scale for proteins at membrane interfaces" by Wimely and White (doi:10.1038/nsb1096-842).';

export const HydrophobicityColorThemeParams = {
    list: PD.ColorList('blue-green-white', { presetKind: 'scale' }),
};
export type HydrophobicityColorThemeParams = typeof HydrophobicityColorThemeParams
export function getHydrophobicityColorThemeParams(ctx: ThemeDataContext) {
    return HydrophobicityColorThemeParams; // TODO return copy
}


export function hydrophobicity(compId: string, scaleIndex: number): number {
    const c = (ResidueHydrophobicity as { [k: string]: number[] })[compId];
    return c === undefined ? 0 : c[scaleIndex];
}

function getAtomicCompId(unit: Unit.Atomic, element: ElementIndex) {
    return unit.model.atomicHierarchy.atoms.label_comp_id.value(element);
}

function getCoarseCompId(unit: Unit.Spheres | Unit.Gaussians, element: ElementIndex) {
    const seqIdBegin = unit.coarseElements.seq_id_begin.value(element);
    const seqIdEnd = unit.coarseElements.seq_id_end.value(element);
    if (seqIdBegin === seqIdEnd) {
        const entityKey = unit.coarseElements.entityKey[element];
        const seq = unit.model.sequence.byEntityKey[entityKey].sequence;
        return seq.compId.value(seqIdBegin - 1); // 1-indexed
    }
}

export function HydrophobicityColorTheme(ctx: ThemeDataContext, props: PD.Values<HydrophobicityColorThemeParams>): ColorTheme<HydrophobicityColorThemeParams> {
    function color(location: Location): Color | string {
        let compId: string | undefined;
        if (StructureElement.Location.is(location)) {
            if (Unit.isAtomic(location.unit)) {
                compId = getAtomicCompId(location.unit, location.element);
            } else {
                compId = getCoarseCompId(location.unit, location.element);
            }
        } else if (Bond.isLocation(location)) {
            if (Unit.isAtomic(location.aUnit)) {
                compId = getAtomicCompId(location.aUnit, location.aUnit.elements[location.aIndex]);
            } else {
                compId = getCoarseCompId(location.aUnit, location.aUnit.elements[location.aIndex]);
            }
        }
        // [ARG,LYS,ASN,GLU,PRO,ASP,TYR,THR] #43FFFF
        // [PHE,ILE,TRP,LEU,VAL,MET,CYS,ALA] #FFFA6F
        let index = 2;
        if (compId && ['ARG', 'LYS', 'ASN', 'GLU', 'PRO', 'ASP', 'TYR', 'THR'].includes(compId)) {
            index = 0;
        } else if (compId && ['PHE', 'ILE', 'TRP', 'LEU', 'VAL', 'MET', 'CYS', 'ALA'].includes(compId)) {
            index = 1;
        }
        return props.list.colors[index] as Color;
    }

    return {
        factory: HydrophobicityColorTheme,
        granularity: 'group',
        preferSmoothing: true,
        color: color as LocationColor,
        props,
        description: Description,
        legend: undefined
    };
}

export const HydrophobicityColorThemeProvider: ColorTheme.Provider<HydrophobicityColorThemeParams, 'hydrophobicity'> = {
    name: 'hydrophobicity',
    label: 'Hydrophobicity',
    category: ColorThemeCategory.Residue,
    factory: HydrophobicityColorTheme,
    getParams: getHydrophobicityColorThemeParams,
    defaultValues: PD.getDefaultValues(HydrophobicityColorThemeParams),
    isApplicable: (ctx: ThemeDataContext) => !!ctx.structure
};
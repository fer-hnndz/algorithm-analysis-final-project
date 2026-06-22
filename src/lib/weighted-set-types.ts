export interface IElementSet<T = string> {
  readonly elements: readonly T[];
  readonly cost: number;
  hasElement(element: T): boolean;
}

export class Elements<T = string> implements IElementSet<T> {
  readonly elements: readonly T[];
  readonly cost: number;

  constructor(elements: T[], cost: number) {
    this.elements = [...elements];
    this.cost = cost;
  }

  hasElement(element: T): boolean {
    return this.elements.includes(element);
  }
}

export class IdentifiedSet<T = string> implements IElementSet<T> {
  readonly id: number;

  private readonly wrapped: IElementSet<T>;

  constructor(wrapped: IElementSet<T>, id: number) {
    this.wrapped = wrapped;
    this.id = id;
  }

  get elements(): readonly T[] {
    return this.wrapped.elements;
  }

  get cost(): number {
    return this.wrapped.cost;
  }

  hasElement(element: T): boolean {
    return this.wrapped.hasElement(element);
  }
}

export interface CoverProposal {
  setIds: number[];
  totalCost: number;
}

export function toIdentifiedSet(
  id: number,
  elements: string[],
  cost: number
): IdentifiedSet<string> {
  return new IdentifiedSet(new Elements(elements, cost), id);
}
